'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  getFolderContents,
  getMainFolders,
  getOrdersFolders,
} from '../../folders/get/get-folders';
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
}

interface FileSystemResponse {
  folders: FolderData[];
  files: FileData[];
}

type FolderTarget = 'project' | 'client' | 'team' | 'all' | null;
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

// Specialized queries based on folder type
async function getProjectFolderContents(
  client: SupabaseClient,
  folderId: string,
  type: FolderType,
): Promise<FileSystemResponse> {
  if (type === 'mainfolder') {
    const folders = await getOrdersFolders(folderId);
    return { folders, files: [] };
  }

  const { data: files, error } = await client
    .from('files')
    .select('url, id, name, type, size, order_files!inner(order_id)')
    .in('order_files.order_id', [folderId]);

  if (error) {
    return handleError(error, 'Error getting project files');
  }

  return { folders: [], files: files || [] };
}

async function getAllFolderContents(
  client: SupabaseClient,
  folderId: string,
  type: FolderType,
  clientOrganizationId: string,
  agencyId: string,
): Promise<FileSystemResponse> {
  console.log('getAllFolderContents', folderId, type);
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
      getMainFolders(client, folderId),
    ]);

    return {
      folders,
      files: filesResult.data ?? [],
    };
  }

  const folders = await getFolderContents(client, folderId);
  const { data: folderData, error } = await client
    .from('folders')
    .select('files(id, url, name, type, size)')
    .eq('id', folderId)
    .single();

  if (error) {
    return handleError(error, 'Error getting folder contents');
  }

  return {
    folders,
    files: folderData?.files ?? [],
  };
}

async function getMemberFolderContents(
  client: SupabaseClient,
  clientOrganizationId: string,
  agencyId: string,
  type: 'client' | 'agency',
): Promise<FileSystemResponse> {
  const members = await fetchUsersAccounts(client, [type === 'client' ? clientOrganizationId : agencyId]);
  const memberIds = members.map((member) => member.id);

  // Get all files where a client member of the organization or agency has uploaded a file (order_files)
  const { data: files, error: filesError } = await client
  .from('files')
  .select(`
    url, id, name, type, size, 
    order_files!inner(orders:orders_v2!inner(client_organization_id, agency_id))
  `)
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
export async function getFoldersAndFiles(
  folderId: string,
  clientOrganizationId: string,
  agencyId: string,
  target: FolderTarget,
  type: FolderType,
): Promise<FileSystemResponse> {
  if (!target || !type) {
    return { folders: [], files: [] };
  }

  try {
    const client = getSupabaseServerComponentClient();

    // Use a switch statement for better organization of different cases
    switch (target) {
      case 'project':
        return await getProjectFolderContents(client, folderId, type);

      case 'all':
        return await getAllFolderContents(
          client,
          folderId,
          type,
          clientOrganizationId,
          agencyId,
        );

      case 'client':
        return await getMemberFolderContents(client, clientOrganizationId, agencyId, 'client');

      case 'team':
        return await getMemberFolderContents(client, clientOrganizationId, agencyId, 'agency');

      default:
        return { folders: [], files: [] };
    }
  } catch (error) {
    console.error('Error getting folders and files:', error);
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
