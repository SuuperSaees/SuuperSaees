'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { UserSettings } from '../../../../../../../../apps/web/lib/user-settings.types';

export const updateUserAccount = async (
  userData: Account.Update,
  userId: Account.Type['id'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: userAccountData, error: errorUpdateUserAccount } =
      await databaseClient
        .from('accounts')
        .update(userData)
        .eq('primary_owner_user_id', userId)
        .eq('is_personal_account', true);

    if (errorUpdateUserAccount)
      throw new Error(
        `Error updating the user account: ${errorUpdateUserAccount.message}`,
      );

    return userAccountData;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};

export const updateUserSettings = async (
  userId: Account.Type['id'],
  userSettings: UserSettings.Update,
) => {
  const client = getSupabaseServerComponentClient();
  try {
    const { data: userSettingsData, error: errorUpdateUserSettings } =
      await client
        .from('user_settings')
        .update(userSettings)
        .eq('user_id', userId);

    if (errorUpdateUserSettings)
      throw new Error(
        `Error updating the user settings: ${errorUpdateUserSettings.message}`,
      );

    return userSettingsData;
  } catch (error) {
    console.error('Error updating the user settings', error);
    throw error;
  }
};
