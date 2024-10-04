'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Database } from '../../../../../../../../apps/web/lib/database.types';


// Hex color validation regex
const isValidHexColor = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

export const upsertOrganizationSettings = async (
  organizationSetting: Omit<
    Database['public']['Tables']['organization_settings']['Insert'],
    'account_id'
  >,
) => {
  const client = getSupabaseServerComponentClient();

  try {
    const {
      data: { user },
      error: authError,
    } = await client.auth.getUser();

    if (authError ?? !user) {
      throw new Error('User not authenticated');
    }

    // Fetch the organization account for the current user
    const { data: organizationAccount } = await client
      .from('accounts')
      .select('id')
      .eq('primary_owner_user_id', user.id)
      .eq('is_personal_account', false)
      .single()
      .throwOnError();

    if (!organizationAccount) {
      throw new Error(
        'Organization account not found or user does not have access.',
      );
    }

    // Validate hex color if key is 'theme_color'
    if (
      organizationSetting.key === 'theme_color' &&
      organizationSetting.value !== '' && // Allow empty string
      !isValidHexColor(organizationSetting.value)
    ) {
      throw new Error('Invalid hex color value for theme_color');
    }

    // Check if the setting already exists
    const { data: existingSetting, error: fetchError } = await client
      .from('organization_settings')
      .select('*')
      .eq('account_id', organizationAccount.id)
      .eq('key', organizationSetting.key)
      .maybeSingle();

    if (fetchError && fetchError.details !== 'No rows returned') {
      throw new Error(fetchError.message);
    }

    if (existingSetting) {
      // If the setting exists, update it
      const { data: updatedSetting, error: updateError } = await client
        .from('organization_settings')
        .update({ value: organizationSetting.value })
        .eq('account_id', organizationAccount.id)
        .eq('key', organizationSetting.key)
        .select()
        .maybeSingle(); // Expecting a single result or no result

      if (updateError) {
        throw new Error(updateError.message);
      }

      return updatedSetting;
    } else {
      // If the setting does not exist, insert it
      const newSetting = {
        account_id: organizationAccount.id,
        key: organizationSetting.key,
        value: organizationSetting.value,
      };

      const { data: insertedSetting, error: insertError } = await client
        .from('organization_settings')
        .insert(newSetting)
        .select()
        .maybeSingle(); // Expecting a single result or no result

      if (insertError) {
        throw new Error(insertError.message);
      }

      return insertedSetting;
    }
  } catch (error) {
    console.error('Error while updating the organization settings', error);
    throw error; // Re-throw error for higher-level handling
  }
};

export const updateOrganization = async (
  id: string,
  ownerUserId: string,
  data: { name?: string },
) => {
  const client = getSupabaseServerComponentClient();

  // get the current user and the account asociated
  try {
    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      console.error('User not found');
      return [];
    }

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (accountError) {
      throw accountError.message;
    }

    const { data: roleData, error: roleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', user.id)
      .single();

    if (roleError) {
      throw roleError.message;
    }

    const rolesAvailable = new Set([
      'agency_member',
      'agency_owner',
      'agency_project_manager',
      'super_admin',
      'custom-role',
    ]);
    // verify if the current user is agency_owner, agency_member, agency_project_manager

    if (rolesAvailable.has(roleData?.account_role ?? '')) {
      // verify in the clients table if the owner client is asociated with the organization
      const { data: organizationSettings, error: settingsError } = await client
        .from('clients')
        .select('agency_id')
        .eq('user_client_id', ownerUserId)
        .single();

      if (settingsError) {
        throw settingsError.message;
      }

      if (organizationSettings.agency_id !== accountData.organization_id) {
        throw new Error('User not authorized');
      }

      const { data: updatedOrganization, error: updateError } = await client
        .from('accounts')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle(); // Expecting a single result or no result

      if (updateError) {
        throw new Error(updateError.message);
      }

      return updatedOrganization;
    } else {
      throw new Error('User not authorized');
    }
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error; // Re-throw error for higher-level handling
  }
};