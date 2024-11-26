'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { UserSettings } from '../../../../../../../../apps/web/lib/user-settings.types';
import { revalidatePath } from 'next/cache';

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
    
      revalidatePath('/clients');
    return userAccountData;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};

export const updateUserRole = async(
  userId: Account.Type['id'],
  role: string,
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: userRoleData, error: errorUpdateUserRole } =
      await databaseClient
        .from('accounts_memberships')
        .update({account_role: role})
        .eq('user_id', userId);

    if (errorUpdateUserRole)
      throw new Error(
        `Error updating the user role: ${errorUpdateUserRole.message}`,
      );

    return userRoleData;
  } catch (error) {
    console.error('Error updating the user role', error);
    throw error;
  }
}

export const updateUserEmail = async(
  userId: Account.Type['id'],
  email: Account.Type['email'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  
  try{

    if(email === undefined || email === null || email === '') {
      throw new Error('Email is required')
    }

    const { data, error } = await databaseClient.auth.admin.updateUserById(
      userId,
      {email: email}
    )

    if (error){
      throw new Error(
        `Error updating the user email: ${error.message}`,
      );
    }
    
    return data;
  }catch(error){
    console.error('Error updating the user email', error);
    throw error;
  }
}

export const updateUserPassword = async(
  userId: Account.Type['id'],
  password: string,
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  
  try{

    if(password === undefined || password === null || password === '') {
      throw new Error('Password is required')
    }

    const { data, error } = await databaseClient.auth.admin.updateUserById(
      userId,
      {password: password}
    )

    if (error){
      throw new Error(
        `Error updating the user password: ${error.message}`,
      );
    }
    
    return data;
  }catch(error){
    console.error('Error updating the user password', error);
    throw error;
  }
}

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

export const generateMagicLinkRecoveryPassword = async (
  email: Account.Type['email'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {
    const { data: generateLinkData, error: errorGenerateLink } =
      await databaseClient.auth.admin.generateLink({
        type: 'magiclink',
        email: email ?? '',
        options: {
          redirectTo: `/`,
        },
      });

    if (errorGenerateLink)
      throw new Error(
        `Error generating the magic link: ${errorGenerateLink.message}`,
      );

    return generateLinkData?.properties?.action_link;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};