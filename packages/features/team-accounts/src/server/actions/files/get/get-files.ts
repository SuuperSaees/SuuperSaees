'use server';

import { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getOrdersFolders } from '../../folders/get/get-folders';
import { fetchUsersAccounts } from '../../members/get/get-member-account';

// getClientFiles,
// getFilesByFolder,
// getFilesWithoutFolder,
// getMemberFiles,

// Those are the functions that are used in the files section of the organization
// and used directly in the custom hook useFileManagement
// The idea is to have a single source of truth for the files
// This way we reduce network requests and improve performance
// By having a single source of truth, we can also improve the code readability and maintainability
// Also, we can nest files and folder of a specific path folder (main, orders, sub)

// helper functions:

export async function getFiles(fileIds: Array<string>) {
  try {
    const client = getSupabaseServerComponentClient();
    const query = client
      .from('files')
      .select('url, id, name, type, size')
      .in('id', fileIds);

    const { data: files, error: filesError } = await query;
    if (filesError)
      throw new Error(`Error getting files, ${filesError.message}`);
    return files;
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}

/**
 * Retrieves files and folders for a specific folder.
 * In case **isProjectFolder** is true, the **folderId** will be used to get the files and folders for the project folder.
 * @param {string} [folderId] - The ID of the folder.
 * @param { 'project' | 'client' | 'team' } [target] - The target of the folder.
 * @param { 'subfolder' | 'mainfolder' } [type] - The type of the folder.
 * @returns {Promise<Array<{url: string, id: string, name: string, type: string}>>}
 */
// todo: possibility to include the entity/target: 'subfolder' | 'project' | 'client' | 'team'
export async function getFoldersAndFiles(
  folderId: string,
  clientOrganizationId: string,
  agencyId: string,
  target: 'project' | 'client' | 'team' | 'all' | null,
  type: 'subfolder' | 'mainfolder' | null,
) {
  if (!target || !type) {
    return {
      folders: [],
      files: [],
    };
  }
  try {
    const client = getSupabaseServerComponentClient();

    const handleError = (error: Error | PostgrestError, message: string) => {
      console.error(`${message}: ${error.message}`);
      return {
        folders: [],
        files: [],
      };
    };

    // Handle main project folder case
    if (target === 'project' && type === 'mainfolder') {
      console.log('folderId', folderId);
      // Treat folderId as client_organization_id
      const folders = await getOrdersFolders(folderId);
      return { folders, files: [] };
    }

    // Handle project folder case
    else if (target === 'project' && type === 'subfolder') {
      const { data: files, error } = await client
        .from('files')
        .select('url, id, name, type, size, order_files!inner(order_id)')
        .in('order_files.order_id', [folderId]);

      if (error) {
        return handleError(error, 'Error getting files');
      }

      return { folders: [], files: files || [] };
    } else if (target === 'all' && type === 'mainfolder') {
      // Here for the files, bring all those that are not in the folder_files table

      const { data: filesData, error: filesError } = await client
        .from('files')
        .select(
          'url, id, name, type, size, folder_files!left(folder_id, client_organization_id)',
        )
        .is('folder_files.folder_id', null) // Check for files without a folder_files relationship
        .eq('folder_files.client_organization_id', folderId); // Ens

      if (filesError) {
        console.error('Error getting files:', filesError);
      }

      // Here for the folders, bring all those that doesn't have a parent_folder_id
      const { data: foldersData, error: foldersError } = await client
        .from('folders')
        .select('id, name, parent_folder_id')
        .is('parent_folder_id', null)
        // treat folder_id as client_organization_id
        .eq('client_organization_id', folderId);

      if (foldersError) {
        console.error('Error getting folders:', foldersError);
      }

      // Combine the files and folders
      return {
        folders:
          foldersData?.map((folder) => ({
            uuid: folder.id,
            title: folder.name,
          })) ?? [],
        files: filesData ?? [],
      };
    } else if (target === 'all' && type === 'subfolder') {
      // Handle regular folder case
      const { data, error } = await client
        .from('folders')
        .select(
          `
          id,
          name,
          files(id, url, name, type, size),
          folders(id, name)
        `,
        )
        .eq('id', folderId)
        .single();

      // Handle error
      if (error) {
        console.error('Error getting folders and files:', error);
        return { folders: [], files: [] };
      }

      console.log('data', JSON.stringify(data, null, 2));

      // Map and filter to construct folders array
      const folders = Array.isArray(data?.folders)
        ? data.folders.map((folder) => ({
            uuid: folder?.id,
            title: folder?.name,
          }))
        : [];

      // Extract files array
      const files = data?.files ?? [];

      return { folders, files };
    } else if (target === 'client') {
      const clientMembers = await fetchUsersAccounts(client, [clientOrganizationId]);
      const clientMembersIds = clientMembers.map((member) => member.id);

      const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type, size')
        .in('user_id', clientMembersIds);

      if (filesError) throw filesError;

      return { folders: [], files };

    } else if (target === 'team') {
      const agencyMembers = await fetchUsersAccounts(client, [agencyId]);
      const agencyMembersIds = agencyMembers.map((member) => member.id);

      const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type, size')
        .in('user_id', agencyMembersIds);

      if (filesError) throw filesError;

      return { folders: [], files };
    }

    return { folders: [], files: [] };
  } catch (error) {
    console.error('Error getting folders and files:', error);
    throw error;
  }
}

export async function getFilesWithoutFolder(clientOrganizationId: string) {
  const client = getSupabaseServerComponentClient();

  // Fetch the current user data
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;

  //Fetch the role of the user

  const { data: userRole, error: userRoleError } = await client
    .from('accounts_memberships')
    .select('account_role')
    .eq('user_id', userData.user.id)
    .single();

  if (userRoleError) throw userRoleError;

  if (
    userRole.account_role === 'agency_owner' ||
    userRole.account_role === 'agency_member' ||
    userRole.account_role === 'agency_project_manager'
  ) {
    // Fetch the agencies of the user
    const { data: agencies, error: agenciesError } = await client
      .from('accounts')
      .select('id')
      .eq('primary_owner_user_id', userData.user.id)
      .eq('is_personal_account', false);

    if (agenciesError) throw agenciesError;

    // Fetch the files without order
    const { data: filesWithoutOrder, error: filesWithoutOrderError } =
      await client
        .from('folder_files')
        .select('file_id')
        .eq('client_organization_id', clientOrganizationId)
        .eq('agency_id', agencies?.[0]?.id ?? '')
        .is('folder_id', null);
    if (filesWithoutOrderError) throw filesWithoutOrderError;

    // Check for associated files
    if (!filesWithoutOrder || filesWithoutOrder.length === 0) {
      return [];
    }

    // Obtain the files corresponding to the obtained IDs
    const { data: files, error: filesError } = await client
      .from('files')
      .select('url, id, name, type')
      .in(
        'id',
        filesWithoutOrder.map((file) => file.file_id),
      );

    if (filesError) throw filesError;

    return files;
  }

  // Fetch the files without order
  const { data: filesWithoutOrder, error: filesWithoutOrderError } =
    await client
      .from('folder_files')
      .select('file_id')
      .eq('client_organization_id', clientOrganizationId)
      .is('folder_id', null);

  if (filesWithoutOrderError) throw filesWithoutOrderError;

  // Check for associated files
  if (!filesWithoutOrder || filesWithoutOrder.length === 0) {
    return [];
  }

  // Obtain the files corresponding to the obtained IDs
  const { data: files, error: filesError } = await client
    .from('files')
    .select('url, id, name, type')
    .in(
      'id',
      filesWithoutOrder.map((file) => file.file_id),
    );

  if (filesError) throw filesError;

  return files;
}

export async function getFilesByFolder(folderId: string) {
  if (!folderId) {
    return [];
  }
  const client = getSupabaseServerComponentClient();

  // Checking if the folder is out of order
  const { data: foldersWithoutOrder } = await client
    .from('folders')
    .select('id')
    .eq('id', folderId);

  if (foldersWithoutOrder?.length === 0) {
    // Get files from 'order_files' associated with the folder
    const { data: files, error: filesError } = await client
      .from('order_files')
      .select('file_id:files(id, url, name, type)')
      .eq('order_id', folderId);

    if (filesError) throw filesError;

    // If no files are associated, return an empty array
    if (!files || files.length === 0) {
      return [];
    }

    return files.map((orderFile) => orderFile.file_id);
  }

  // Get files from 'folder_files' associated with the folder
  const { data: files, error: filesError } = await client
    .from('folder_files')
    .select('file_id:files(id, url, name, type)')
    .eq('folder_id', folderId);

  if (filesError) throw filesError;

  // If no files are associated, return an empty array
  if (!files || files.length === 0) {
    return [];
  }

  return files.map((folderFile) => folderFile.file_id);
}

export async function verifyItIsOrderFile(fileId: string) {
  const client = getSupabaseServerComponentClient();

  // Checking if the file is out of order
  const { data: fileData, error: fileDataError } = await client
    .from('order_files')
    .select('file_id')
    .eq('file_id', fileId);

  if (fileDataError) throw fileDataError;

  if (fileData.length === 0) {
    return false;
  }

  return true;
}

export async function getMemberFiles(clientOrganizationId: string) {
  const client = getSupabaseServerComponentClient();

  // Fetch the files associated with the client organization
  const { data: fileData, error: fileDataError } = await client
    .from('folder_files')
    .select('file:files(id, url, name, type, user_id)')
    .eq('client_organization_id', clientOrganizationId);

  if (fileDataError) throw fileDataError;

  // Flatten the file objects to remove the 'file' nesting
  const flattenedFileData = fileData.map(({ file }) => ({
    id: file?.id,
    url: file?.url,
    name: file?.name,
    type: file?.type,
    user_id: file?.user_id,
  }));

  // Fetch the orders of the client organization
  const { data: ordersData, error: ordersDataError } = await client
    .from('orders_v2')
    .select('uuid')
    .eq('client_organization_id', clientOrganizationId);

  if (ordersDataError) throw ordersDataError;

  // Fetch the files associated with the orders
  const { data: orderFilesData, error: orderFilesDataError } = await client
    .from('order_files')
    .select('file:files(id, url, name, type, user_id)')
    .in(
      'order_id',
      ordersData.map((orderData) => orderData.uuid),
    );

  if (orderFilesDataError) throw orderFilesDataError;

  // Flatten the file objects to remove the 'file' nesting
  const flattenedOrderFileData = orderFilesData.map(({ file }) => ({
    id: file?.id,
    url: file?.url,
    name: file?.name,
    type: file?.type,
    user_id: file?.user_id,
  }));

  // Combine the file data
  const allFiles = [...flattenedFileData, ...flattenedOrderFileData];

  // Fetch the list of client user_ids
  const { data: clientUsers, error: clientUsersError } = await client
    .from('clients')
    .select('user_client_id');

  if (clientUsersError) throw clientUsersError;

  const clientUserIds = clientUsers.map((client) => client.user_client_id);

  // Filter files that are not associated with clients
  const nonClientFiles = allFiles.filter(
    (file) => !clientUserIds.includes(file.user_id ?? ''),
  );

  return nonClientFiles.map(({ user_id: _user_id, ...rest }) => rest);
}

export async function getClientFiles(clientOrganizationId: string) {
  const client = getSupabaseServerComponentClient();

  // Fetch the files associated with the client organization
  const { data: fileData, error: fileDataError } = await client
    .from('folder_files')
    .select('file:files(id, url, name, type, user_id)')
    .eq('client_organization_id', clientOrganizationId);

  if (fileDataError) throw fileDataError;

  // Flatten the file objects to remove the 'file' nesting
  const flattenedFileData = fileData.map(({ file }) => ({
    id: file?.id,
    url: file?.url,
    name: file?.name,
    type: file?.type,
    user_id: file?.user_id,
  }));

  // Fetch the orders of the client organization
  const { data: ordersData, error: ordersDataError } = await client
    .from('orders_v2')
    .select('uuid')
    .eq('client_organization_id', clientOrganizationId);

  if (ordersDataError) throw ordersDataError;

  // Fetch the files associated with the orders
  const { data: orderFilesData, error: orderFilesDataError } = await client
    .from('order_files')
    .select('file:files(id, url, name, type, user_id)')
    .in(
      'order_id',
      ordersData.map((orderData) => orderData.uuid),
    );

  if (orderFilesDataError) throw orderFilesDataError;

  // Flatten the file objects to remove the 'file' nesting
  const flattenedOrderFileData = orderFilesData.map(({ file }) => ({
    id: file?.id,
    url: file?.url,
    name: file?.name,
    type: file?.type,
    user_id: file?.user_id,
  }));

  // Combine the file data
  const allFiles = [...flattenedFileData, ...flattenedOrderFileData];

  // Fetch the list of client user_ids
  const { data: clientUsers, error: clientUsersError } = await client
    .from('clients')
    .select('user_client_id');

  if (clientUsersError) throw clientUsersError;

  const clientUserIds = clientUsers.map((client) => client.user_client_id);

  // Filter files that are associated with clients
  const clientFiles = allFiles.filter((file) =>
    clientUserIds.includes(file.user_id ?? ''),
  );

  return clientFiles.map(({ user_id: _user_id, ...rest }) => rest);
}

export async function getUrlFile(fileId: string) {
  try {
    const client = getSupabaseServerComponentClient();

    // Fetch the file details
    const { data: fileData, error: fileDataError } = await client
      .from('files')
      .select('id, url')
      .eq('id', fileId)
      .single();

    if (fileDataError) throw fileDataError;

    return fileData;
  } catch (error) {
    console.error('Error getting file:', error);
    return null;
  }
}
