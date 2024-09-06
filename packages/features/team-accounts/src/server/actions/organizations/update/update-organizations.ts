'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Database } from '../../../../../../../../apps/web/lib/database.types';


// type OrganizationSettingKey =
//   Database['public']['Enums']['organization_setting_key'];
// Hex color validation regex
const isValidHexColor = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

export const upsertOrganizationSettings = async (
  organizationSetting: Omit<
    Database['public']['Tables']['organization_settings']['Insert'],
    'account_id'
  >,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }
    // only the owner can change the settings
    const { data: organizationAccount, error: organizationAccountError } =
      await client
        .from('accounts')
        .select('id')
        .eq('primary_owner_user_id', user.id)
        .eq('is_personal_account', false)
        .single()
        .throwOnError();

    if (organizationAccountError) {
      throw organizationAccountError.message;
    }
    // Validate hex color if key is 'theme_color'
    if (
      organizationSetting.key === 'theme_color' &&
      organizationSetting.value !== '' && // Allow empty string
      !isValidHexColor(organizationSetting.value)
    ) {
      throw new Error('Invalid hex color value for theme_color');
    }
    const newSetting = {
      account_id: organizationAccount.id,
      key: organizationSetting.key,
      value: organizationSetting.value,
    };
    console.log('newSetting', newSetting);
    // Update if exists
    const { data: updatedSetting, error: updateError } = await client
      .from('organization_settings')
      .update({ value: organizationSetting.value })
      .eq('account_id', organizationAccount.id)
      .eq('key', organizationSetting.key)
      .select()
      .single();

    if (updateError && updateError.code !== 'PGRST116') {
      // If not a "No rows updated" error, throw
      throw new Error(updateError.message);
    }

    if (updatedSetting) {
      // Return updated setting if exists
      return updatedSetting;
    }

    // Insert if no existing setting was updated
    const { data: insertedSetting, error: insertError } = await client
      .from('organization_settings')
      .insert(newSetting)
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return insertedSetting;
  } catch (error) {
    console.error('Error while updating the organization settings', error);
    throw error;
  }
};