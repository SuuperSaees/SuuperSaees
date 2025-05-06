'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getFoldersByIds } from '../../folders/get/get-folders';
import { fetchUsersAccounts } from '../../members/get/get-member-account';

// Types
interface FileData {
  url: string;
  id: string;
  name: string;
  type: string;
  size: number;
}

interface FolderData {
  uuid: string;
  title: string;
  parent_folder_id?: string;
}

interface FileSystemResponse {
  folders: FolderData[];
  files: FileData[];
  parent_folder_id?: string;
}

type FolderType = 'subfolder' | 'mainfolder' | null;

// Utility function to handle errors consistently
const handleError = (
  error: Error | PostgrestError,
  message: string,
): FileSystemResponse => {
  console.error(`${message}: ${error.message}`);
  return {
    folders: [],
    files: [],
  };
};

// Base file query builder
const createFileQuery = (client: SupabaseClient) => {
  return client.from('files').select('url, id, name, type, size');
};

export async function getFiles(
  client: SupabaseClient,
  fileIds: string[],
): Promise<FileData[]> {
  try {
    const { data: files, error: filesError } = await createFileQuery(client).in(
      'id',
      fileIds,
    );

    if (filesError) {
      throw new Error(`Error getting files: ${filesError.message}`);
    }

    return files || [];
  } catch (error) {
    console.error('Error getting files:', error);
    throw error;
  }
}

export async function getAllFolderContents(
  client: SupabaseClient,
  folderId: string,
  type: FolderType,
  clientOrganizationId: string,
  agencyId: string,
): Promise<FileSystemResponse> {
  if (type === 'mainfolder') {
    // This group all files where the user_id of the file belongs the client_organization_id or agency_id
    const clientAndAgencyMembers = await fetchUsersAccounts(client, [
      clientOrganizationId,
      agencyId,
    ]);
    const clientAndAgencyMembersIds = clientAndAgencyMembers.map(
      (member) => member.id,
    );
    const [filesResult, folders] = await Promise.all([
      client
        .from('files')
        .select(
          `url, id, name, type, size, folder_files(folder_id, client_organization_id),
          order_files!inner(orders:orders_v2!inner(client_organization_id, agency_id))`,
        )
        .is('folder_files.folder_id', null)
        .in('user_id', clientAndAgencyMembersIds)
        .eq('order_files.orders.client_organization_id', clientOrganizationId)
        .eq('order_files.orders.agency_id', agencyId),
      getFoldersByIds([], 'subfolder', { clientOrganizationId, agencyId }),
    ]);

    return {
      folders,
      files: filesResult.data ?? [],
    };
  }

  const folders = await getFoldersByIds([folderId]);
  const { data: folderData, error } = await client
    .from('folders')
    .select('files(id, url, name, type, size), parent_folder_id')
    .eq('id', folderId)
    .single();

  if (error) {
    return handleError(error, 'Error getting folder contents');
  }
  return {
    parent_folder_id: folderData?.parent_folder_id ?? '',
    folders,
    files: folderData?.files ?? [],
  };
}

export async function getMemberFolderContents(
  client: SupabaseClient,
  clientOrganizationId: string,
  agencyId: string,
  type: 'client' | 'agency',
): Promise<FileSystemResponse> {
  const members = await fetchUsersAccounts(client, [
    type === 'client' ? clientOrganizationId : agencyId,
  ]);
  const memberIds = members.map((member) => member.id);

  // Get all files where a client member of the organization or agency has uploaded a file (order_files)
  const { data: files, error: filesError } = await client
    .from('files')
    .select(
      `
    url, id, name, type, size, 
    order_files!inner(orders:orders_v2!inner(client_organization_id, agency_id))
  `,
    )
    .in('user_id', memberIds)
    .eq('order_files.orders.client_organization_id', clientOrganizationId)
    .eq('order_files.orders.agency_id', agencyId);

  if (filesError) {
    throw filesError;
  }

  return { folders: [], files: files || [] };
}

/**
 * Retrieves files and folders for a specific folder.
 * In case **isProjectFolder** is true, the **folderId** will be used to get the files and folders for the project folder.
 * @param {string} [folderId] - The ID of the folder.
 * @param { 'project' | 'client' | 'team' } [target] - The target of the folder.
 * @param { 'subfolder' | 'mainfolder' } [type] - The type of the folder.
 * @returns {Promise<Array<{url: string, id: string, name: string, type: string}>>}
 */
// Function to transform file data
const transformFiles = (files: FileData[]) => {
  return files.map((file) => ({
    id: file.id,
    url: file.url,
    name: file.name,
    type: file.type,
    size: file.size,
  }));
};

// Function to transform folder data
const transformFolders = (
  folders: {
    id: string;
    name: string;
    parent_folder_id?: string | null;
  }[],
) => {
  return folders.map((folder) => ({
    uuid: folder.id ?? '',
    title: folder.name ?? '',
    parent_folder_id: folder.parent_folder_id ?? '',
  }));
};

export async function getFoldersAndFiles(
  folderId: string,
  clientOrganizationId: string,
  agencyId: string,
  type: FolderType,
): Promise<FileSystemResponse> {
  if (!type) {
    return { folders: [], files: [] };
  }

  try {
    const client = getSupabaseServerComponentClient();

    if (type === 'mainfolder') {
      // Fetch both folders and files in a single query
      const { data, error } = await client
        .from('folders')
        .select(
          `files(id, url, name, type, size), folders(id, name, parent_folder_id)`,
        )
        .eq('client_organization_id', clientOrganizationId)
        .eq('agency_id', agencyId)
        .is('parent_folder_id', null)
        .single();

      if (error) {
        console.error('Error getting main folder contents:', error);
        throw error;
      }

      const files = transformFiles(data.files ?? []);

      const folders = transformFolders(data?.folders ?? []);
      return {
        folders,
        files,
      };
    }

    // For 'subfolder' or any other type
    const { data, error } = await client
      .from('folders')
      .select(
        'files(id, url, name, type, size), parent_folder_id, folders(id, name, parent_folder_id)',
      )
      .eq('id', folderId)
      .single();

    if (error) {
      console.error('Error getting folder contents:', error);
      throw error;
    }

    const files = transformFiles(data?.files ?? []);
    const folders = transformFolders(data?.folders ?? []);

    return {
      parent_folder_id: data?.parent_folder_id ?? '',
      folders,
      files,
    };
  } catch (error) {
    console.error('Error getting folders and files:', error);
    throw error;
  }
}

export async function getFolderFiles(folderId: string) {
  try {
    const client = getSupabaseServerComponentClient();

    // Fetch the file details
    const { data: files, error: fileDataError } = await client
      .from('files')
      .select(
        'id, url, name, type, size, created_at, message_id, folder_files!inner(folder_id), user:accounts(id, name, email, picture_url, settings:user_settings(name, picture_url))',
      )
      .eq('folder_files.folder_id', folderId);

    if (fileDataError)
      throw new Error(`Error getting folder files: ${fileDataError.message}`);

    return files ?? [];
  } catch (error) {
    console.error('Error getting folder files:', error);
    throw error;
  }
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
