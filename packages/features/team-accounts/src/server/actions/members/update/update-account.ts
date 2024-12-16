'use server';

import { revalidatePath } from 'next/cache';



import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { UserSettings } from '../../../../../../../../apps/web/lib/user-settings.types';
import { updateClient } from '../../clients/update/update-client';
import { getOrganizationByUserId } from '../../organizations/get/get-organizations';


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
    const { error: errorUpdateUserAccount } =
      await databaseClient
        .from('accounts')
        .update(userData)
        .eq('primary_owner_user_id', userId)
        .eq('is_personal_account', true);

    if (errorUpdateUserAccount)
      throw new Error(
        `Error updating the user account: ${errorUpdateUserAccount.message}`,
      );
    
      // revalidatePath('/clients');
      // revalidatePath(`/clients/organizations/*`);

      
    return userId;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};

export const switchUserOrganization = async (
  organizationId: Account.Type['organization_id'],
  userId: Account.Type['id'],
) => {
  try {
    await updateUserAccount(
      {
        organization_id: organizationId,
      },
      userId,
    );

    await updateClient({organization_client_id: organizationId ?? ''}, userId,undefined, true);

  } catch (error) {
    console.error('Error switching the user organization', error);
    throw error;
  }
}

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
        .update({'account_role': role})
        .eq('user_id', userId);
        

    if (errorUpdateUserRole)
      throw new Error(
        `Error updating the user role: ${errorUpdateUserRole.message}`,
      );
    
    await handleHierarchyChange(userId, role, databaseClient);

    revalidatePath('/clients')
    revalidatePath('/team')

    return userRoleData;
  } catch (error) {
    console.error('Error updating the user role', error);
    throw error;
  }
}


const handleHierarchyChange = async(
  userId: Account.Type['id'], //id of the new agency_owner / client_owner
  role: string, //selected role for the newly updated user
  databaseClient: SupabaseClient<Database>,
) => {
  if(role !== 'agency_owner' && role !== 'client_owner') {
    //No hierarchy change
    return;
  }
  const defaultRole = role === 'agency_owner' ? 'agency_member' : 'client_member';
  const {id: organizationId} = await getOrganizationByUserId(userId, true);

  //Get the previous owner
  const { data: previousOwner, error: errorGetPreviousOwner } =
    await databaseClient
      .from('accounts')
      .select('primary_owner_user_id')
      .eq('id', organizationId)
      .single();
  
  const previousOwnerId = previousOwner?.primary_owner_user_id;
  
  if (errorGetPreviousOwner)
    throw new Error(
      `Error getting the previous owner: ${errorGetPreviousOwner.message}`,
    );
  
  // Update the previous owner roles
  const { error: updateRolesError } =
    await databaseClient
      .from('accounts_memberships')
      .update({account_role: defaultRole})
      .eq('account_role', role)
      .eq('account_id', organizationId)
      .neq('user_id', userId);

  if (updateRolesError)
    throw new Error(
      `Error updating the previous owner roles: ${updateRolesError.message}`,
    );
  
  // Update the organization primary owner
  const { error: updatePrimaryOwnerError } =
  await databaseClient
    .from('accounts')
    .update({primary_owner_user_id: userId})
    .eq('id', organizationId);
  
  if (updatePrimaryOwnerError)
    throw new Error(
      `Error updating the organization primary owner: ${updatePrimaryOwnerError.message}`,
    );
  
  //Specific case where the hierarchy change is on agency level
  if(role === 'agency_owner') {
    //Update propietary id on subscriptions table
    const { error: errorUpdateOnSubscriptions } =
      await databaseClient
        .from('subscriptions')
        .update({propietary_organization_id: userId})
        .eq('propietary_organization_id', previousOwnerId ?? '')
      
    if (errorUpdateOnSubscriptions)
      throw new Error(
        `Error updating the previous owner on subscriptions: ${errorUpdateOnSubscriptions.message}`,
      );
    
    //Update propietary id on services table
    const { error: errorUpdateOnServices } =
    await databaseClient
      .from('services')
      .update({propietary_organization_id: userId})
      .eq('propietary_organization_id', previousOwnerId ?? '')
    
    if (errorUpdateOnServices)
      throw new Error(
        `Error updating the previous owner on services: ${errorUpdateOnServices.message}`,
      );
    
    //Update propietary id on briefs table
    const { error: errorUpdateOnBriefs } =
    await databaseClient
      .from('briefs')
      .update({propietary_organization_id: userId})
      .eq('propietary_organization_id', previousOwnerId ?? '')
    
    if (errorUpdateOnBriefs)
      throw new Error(
        `Error updating the previous owner on briefs: ${errorUpdateOnBriefs.message}`,
      );
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