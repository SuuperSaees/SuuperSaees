'use server';

import { revalidatePath } from 'next/cache';



import { SupabaseClient } from '@supabase/supabase-js';



import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Account } from '../../../../../../../../apps/web/lib/account.types';
import { Database, Json } from '../../../../../../../../apps/web/lib/database.types';
import { UserSettings } from '../../../../../../../../apps/web/lib/user-settings.types';
import { updateClient } from '../../clients/update/update-client';
import { formatToTimestamptz } from '../../../../../../../../apps/web/app/utils/format-to-timestamptz';
import { Organization } from '../../../../../../../../apps/web/lib/organization.types';

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
        .eq('id', userId)

    if (errorUpdateUserAccount)
      throw new Error(
        `Error updating the user account: ${errorUpdateUserAccount.message}`,
      );
      
    return userId;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};

export const switchUserOrganization = async (
  organizationId: Organization.Type['id'],
  userId: Account.Type['id'],
) => {
  try {
    // await updateUserAccount(
    //   {
    //     organization_id: organizationId,
    //   },
    //   userId,
    // );

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
  host?: string,
) => {
  databaseClient =
    databaseClient ??
    getSupabaseServerComponentClient({
      admin: adminActivated,
    });
  try {

    const { data: subdomainData, error: errorGetSubdomain } = await databaseClient
      .from('subdomains')
      .select('id')
      .eq('domain', host ?? '')
      .single();

    if(errorGetSubdomain)
      throw new Error(
        `Error getting the subdomain: ${errorGetSubdomain.message}`,
      );

    const subdomainId = subdomainData?.id;

    const { data: organizationData, error: errorGetOrganization } = await databaseClient
      .from('organization_subdomains')
      .select('organization_id')
      .eq('subdomain_id', subdomainId ?? '')
      .single();

    if(errorGetOrganization)
      throw new Error(
        `Error getting the organization: ${errorGetOrganization.message}`,
      );
      
    const organizationId = organizationData?.organization_id;

    const { data: existClient, error: errorExistClient } = await databaseClient
      .from('clients')
      .select('organization_client_id')
      .eq('agency_id', organizationId ?? '')
      .eq('user_client_id', userId)
      .single();

    if(errorExistClient && errorExistClient.code !== 'PGRST116')
      throw new Error(
        `Error getting the client: ${errorExistClient.message}`,
      );

    const clientId = existClient?.organization_client_id;
    
    const { data: userRoleData, error: errorUpdateUserRole } =
      await databaseClient
        .from('accounts_memberships')
        .update({'account_role': role})
        .eq('user_id', userId)
        .eq('organization_id', clientId ?? organizationId ?? '');
        

    if (errorUpdateUserRole)
      throw new Error(
        `Error updating the user role: ${errorUpdateUserRole.message}`,
      );
    
    await handleHierarchyChange(userId, role, databaseClient, clientId ?? organizationId ?? '');

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
  organizationId: Organization.Type['id'],
) => {
  if(role !== 'agency_owner' && role !== 'client_owner') {
    //No hierarchy change
    return;
  }
  const defaultRole = role === 'agency_owner' ? 'agency_member' : 'client_member';

  //Get the previous owner
  const { data: previousOwner, error: errorGetPreviousOwner } =
    await databaseClient
      .from('organizations')
      .select('owner_id')
      .eq('id', organizationId)
      .single();
  
  const previousOwnerId = previousOwner?.owner_id;
  
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
      .eq('organization_id', organizationId)
      .neq('user_id', userId);

  if (updateRolesError)
    throw new Error(
      `Error updating the previous owner roles: ${updateRolesError.message}`,
    );
  
  // Update the organization primary owner
  const { error: updatePrimaryOwnerError } =
  await databaseClient
    .from('organizations')
    .update({owner_id: userId})
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
  domain: string,
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

    await databaseClient.rpc('update_user_credentials', {
      p_email: data?.user?.email ?? '',
      p_domain: domain,
      p_password:  '',
    });

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
    // If updating preferences, we need to merge with existing preferences
    if (userSettings.preferences) {
      // First, get the current user settings to properly merge preferences
      const { data: currentUserSettings, error: fetchError } = await client
        .from('user_settings')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        console.error('Error fetching current user settings:', fetchError);
        throw new Error(fetchError.message);
      }

      // Handle preferences update
      if (currentUserSettings?.preferences) {
        // Get current preferences
        const currentPreferences = currentUserSettings.preferences;
        
        // Deep merge the current preferences with the new ones
        if (typeof currentPreferences === 'object' && !Array.isArray(currentPreferences) && currentPreferences !== null) {
          userSettings.preferences = deepMerge(
            currentPreferences as Record<string, unknown>, 
            userSettings.preferences as Record<string, unknown>
          ) as Json;
        }
      }
    }

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

/**
 * Deep merge utility function to merge nested objects
 * @param target The target object to merge into
 * @param source The source object to merge from
 * @returns The merged object
 */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Record<string, unknown>): T {
  const output = { ...target };

  for (const key in source) {
    if (source[key] === null || source[key] === undefined) {
      continue; // Skip null or undefined values
    }

    if (
      typeof source[key] === 'object' && 
      !Array.isArray(source[key]) && 
      source[key] !== null &&
      key in target && 
      typeof target[key as keyof T] === 'object' && 
      !Array.isArray(target[key as keyof T])
    ) {
      // If both values are objects, recursively merge them
      output[key as keyof T] = deepMerge(
        target[key as keyof T] as Record<string, unknown>, 
        source[key] as Record<string, unknown>
      ) as T[keyof T];
    } else {
      // Otherwise, just assign the source value
      output[key as keyof T] = source[key] as T[keyof T];
    }
  }

  return output;
}

export const verifyUserCredentials = async (
  domain: string,
  email: string,
  password: string,
) => {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });
  const { data, error } = await client.rpc('verify_user_credentials', {
    p_domain: domain,
    p_email: email,
    p_password: password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export const generateMagicLinkRecoveryPassword = async (
  email: Account.Type['email'],
  databaseClient?: SupabaseClient<Database>,
  adminActivated = false,
  fetchMagicLink = false,
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

    if (fetchMagicLink) {
      if (!generateLinkData?.properties?.action_link) {
        throw new Error('Error signing in with email and password');
      }
      const response = await fetch(generateLinkData?.properties?.action_link ?? '', {
        method: 'GET',
        redirect: 'manual',
      });
  
      const location = response.headers.get('Location');
  
      if (!location) {
        throw new Error(`Error signing in with email and password`);
      }

      return location;
    }

    return generateLinkData?.properties?.action_link;
  } catch (error) {
    console.error('Error updating the user account', error);
    throw error;
  }
};

export const partialDeleteUserAccount = async(
  userId: Account.Type['id'],
) => {
  const client = getSupabaseServerComponentClient();
  const { error: errorUpdateUserAccount } =
    await client
      .from('accounts')
      .update({deleted_on: formatToTimestamptz(new Date())})
      .eq('id', userId);
  
  revalidatePath('/team');

  if (errorUpdateUserAccount)
    throw new Error(
      `Error updating the user account: ${errorUpdateUserAccount.message}`,
    );
}
