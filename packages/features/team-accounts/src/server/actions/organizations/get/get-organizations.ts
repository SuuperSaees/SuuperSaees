'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const getOrganizationSettings = async () => {
  try {
    const client = getSupabaseServerComponentClient();

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', user.id)
      .single();

    if (accountError) {
      throw accountError.message;
    }

    const { data: organizationSettings, error: settingsError } = await client
      .from('organization_settings')
      .select()
      .eq('account_id', accountData.organization_id ?? '')
      .single();

    if (settingsError) {
      throw settingsError.message;
    }

    return organizationSettings;
  } catch (error) {
    console.error('Error fetching organization settings:', error);
    throw error;
  }
};
