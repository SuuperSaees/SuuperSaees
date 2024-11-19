'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { UserSettings } from '../../../../../../../../apps/web/lib/user-settings.types';

export const updateAccountData = async (accountId: string, accountDataToUpdate: UserSettings.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();

    let dataToUpdate = {};
    dataToUpdate = {
      ...accountDataToUpdate,
    }

    const { data: accountData, error: accountDataError } = await client
        .from('accounts')
        .update({
          name: accountDataToUpdate.name ?? '',
        })
        .eq('id', accountId)
        .select(`id, email`)
        .single();

    if (accountDataError) {
      console.error('Error updating accounts table:', accountDataError);
      throw new Error(accountDataError.message);
    }

    if (accountData) {
      dataToUpdate = {
        ...dataToUpdate,
        user_id: accountData.id ?? ''
      }
    }

    const { data: userData, error: userDataError } = await client
        .from('user_settings')
        .update({
          name: accountDataToUpdate.name ?? '',
          phone_number: accountDataToUpdate.phone_number ?? '',
          calendar: accountDataToUpdate.calendar ?? '',
          picture_url: accountDataToUpdate.picture_url ?? '',
        })
        .eq('user_id', accountId)
        .select()
        .single();
      
    if (userDataError) {
      console.error('Error updating user_settings:', userDataError);
      throw new Error(userDataError.message);
    }

    return {
      userData,
      accountData,
    };
  } catch (error) {
    console.error('Error updating account:', error);
  }
};

