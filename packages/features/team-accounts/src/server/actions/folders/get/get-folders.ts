'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

interface FolderData {
  id: string;
  name: string;
  parent_folder_id?: string | null;
  folders?: FolderData[];
}

export async function CheckIfItIsAnOrderFolder(folderUuid: string) {
  const client = getSupabaseServerComponentClient();

  // Fetch the folders within the selected folder
  const { data: folders, error: foldersError } = await client
    .from('orders_v2')
    .select('title, uuid')
    .eq('uuid', folderUuid);

  if (foldersError) throw foldersError;

  if (folders.length > 0) return true;

  if (folderUuid === '') return true;

  return false;
}

/**
 * Fetch folders based on folder IDs, root configuration, and type.
 * Handles both root and subfolder scenarios.
 * @param {string[]} folderIds - The IDs of the folders.
 * @param {'root' | 'subfolder'} type - The type of the folder, either 'root' or 'subfolder'.
 * @param {{clientOrganizationId?: string, agencyId?: string}} [root] - Optional root folder configuration.
 * @returns {Promise<FolderResponse[]>} - A promise resolving to a list of folder responses.
 */

export async function getFoldersByIds(
  folderIds: string[],
  type: 'root' | 'subfolder' = 'subfolder',
  root?: { clientOrganizationId?: string; agencyId?: string },
): Promise<{ uuid: string; title: string }[]> {
  try {
    const client = getSupabaseServerComponentClient();
    const baseQuery =
      type === 'root'
        ? client.from('folders').select('id, name, parent_folder_id')
        : client.from('folders').select('id, name, parent_folder_id, folders(id, name, parent_folder_id)');

    let query = baseQuery;

    if (root) {
      // Fetch root folders
      query = query.is('parent_folder_id', null);

      if (root.clientOrganizationId && !root.agencyId) {
        query = query.eq('client_organization_id', root.clientOrganizationId);
      } else if (root.agencyId && !root.clientOrganizationId) {
        query = query.eq('agency_id', root.agencyId);
      } else if (root.agencyId && root.clientOrganizationId) {
        query = query
          .eq('agency_id', root.agencyId)
          .eq('client_organization_id', root.clientOrganizationId);
      } else {
        return [];
      }
    } else if (folderIds.length > 0) {
      // Fetch subfolders with nested folders
      query = query.in('id', folderIds);
    } else {
      return [];
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching folders:', error.message);
      return [];
    }

    if (!data) {
      return [];
    }

    if (type === 'subfolder') {
      const folders = transformFolderResult(data as FolderData[], type);
      return folders;
    }

    const folders = transformFolderResult(data as FolderData[], type);
    return folders;
  } catch (error) {
    console.error('Error in getFoldersByIds:', error);
    throw error;
  }
}

const transformFolderResult = (
  folders: FolderData[],
  type: 'root' | 'subfolder',
) => {
  if (type === 'root') {
    return folders.map((folder) => ({
      uuid: folder.id ?? '',
      title: folder.name ?? '',
      parent_folder_id: folder.parent_folder_id ?? '',
    }));
  }

  const foldersWithSubfolders = folders.flatMap(
    (folder) =>
      folder.folders?.map((subfolder) => ({
        uuid: subfolder.id,
        title: subfolder.name ?? '',
        parent_folder_id: folder.id,
      })) ?? [],
  );

  return foldersWithSubfolders;
};
