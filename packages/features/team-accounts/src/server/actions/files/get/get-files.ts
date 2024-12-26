'use server';

import { SupabaseClient } from '@supabase/supabase-js';
import { PostgrestError } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getOrdersFolders, getMainFolders, getFolderContents } from '../../folders/get/get-folders';
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
): Promise<FileSystemResponse> {
  if (type === 'mainfolder') {
    const [filesResult, folders] = await Promise.all([
      client
        .from('files')
        .select(
          'url, id, name, type, size, folder_files!left(folder_id, client_organization_id)',
        )
        .is('folder_files.folder_id', null)
        .eq('folder_files.client_organization_id', folderId),
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
  organizationId: string,
): Promise<FileSystemResponse> {
  const members = await fetchUsersAccounts(client, [organizationId]);
  const memberIds = members.map((member) => member.id);

  const { data: files, error: filesError } = await createFileQuery(client).in(
    'user_id',
    memberIds,
  );

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
        return await getAllFolderContents(client, folderId, type);

      case 'client':
        return await getMemberFolderContents(client, clientOrganizationId);

      case 'team':
        return await getMemberFolderContents(client, agencyId);

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
