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

    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Fetch the organization account for the current user
    const { data: organizationAccount} =
      await client
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