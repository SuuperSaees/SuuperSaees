'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// import { Folder } from '../../../../../../../../apps/web/lib/folder.types';

export const createFolder = async (folderName: string, client_organization_id: string, isSubfolder?: boolean, currentPath?: Array<{ title: string; uuid?: string }>) => {
  try {
    console.log('client_organization_id', client_organization_id);
    console.log('isSubfolder', isSubfolder);
    console.log('currentPath', currentPath);

    const client = getSupabaseServerComponentClient();

    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    // Fetch the user role
    const { data: userRoleData, error: userRoleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userData.user.id)
      .single();

    if (userRoleError) throw userRoleError.message;

    console.log('userRoleData', userRoleData);

    let agencyId = null;

    // Fetch the agencies of the user if is agency_owner
    if (userRoleData?.account_role === 'agency_owner' || userRoleData?.account_role === 'agency_member' || userRoleData?.account_role === 'agency_project_manager') {
      const { data: agencies, error: agenciesError } = await client
        .from('accounts')
        .select('id')
        .eq('primary_owner_user_id', userData.user.id)
        .eq('is_personal_account', false)
        .single();
      
      if (agenciesError) throw agenciesError.message;

      agencyId = agencies?.id;

    } else {
      // Fetch the client_organization_id of the user
      const { data: clientOrganization, error: clientOrganizationError } = await client
        .from('clients')
        .select('agency_id')
        .eq('user_client_id', userData.user.id)
        .single();

      if (clientOrganizationError) throw clientOrganizationError.message;

      agencyId = clientOrganization?.agency_id;
    }

    let folderToInsert = {};

    if ( isSubfolder ){

      folderToInsert = {
        name: folderName,
        agency_id: agencyId,
        client_organization_id: client_organization_id,
        parent_folder_id: currentPath && currentPath.length > 0 ? currentPath[currentPath.length - 1]?.uuid : undefined,
        is_subfolder: true,
      };

      const { data: folderData, error: folderDataError } = await client
      .from('folders')
      .insert(folderToInsert)
      .select();

      if (folderDataError) throw folderDataError.message;

      return folderData;
    }

    folderToInsert = {
      name: folderName,
      agency_id: agencyId,
      client_organization_id: client_organization_id,
    };


    const { data: folderData, error: folderDataError } = await client
      .from('folders')
      .insert(folderToInsert)
      .select();

    if (folderDataError) throw folderDataError.message;

    return folderData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
