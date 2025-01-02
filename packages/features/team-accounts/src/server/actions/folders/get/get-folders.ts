'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { getUserRoleById } from '../../members/get/get-member-account';

interface FolderData {
  id: string;
  name: string;
  parent_folder_id?: string | null;
}

interface FolderResponse {
  uuid: string;
  title: string;
}

// Base folder query builder
const createFolderQuery = (client: SupabaseClient) => {
  return client.from('folders');
};

export async function getOrdersFolders(clientOrganizationId: string) {
  const client = getSupabaseServerComponentClient();

  // Fetch the current user data
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError) throw userError;

  const userRole = await getUserRoleById(userData.user.id);

  if (
    userRole === 'agency_owner' ||
    userRole === 'agency_member' ||
    userRole === 'agency_project_manager'
  ) {
    // Fecth the agencies of the user
    const { data: agencies, error: agenciesError } = await client
      .from('accounts')
      .select('id')
      .eq('primary_owner_user_id', userData.user.id)
      .eq('is_personal_account', false);

    if (agenciesError) throw agenciesError;

    // Fetch the orders to create the folders
    const { data: folders, error: foldersError } = await client
      .from('orders_v2')
      .select('title, uuid')
      .eq('agency_id', agencies?.[0]?.id ?? '')
      .eq('client_organization_id', clientOrganizationId);

    if (foldersError) throw foldersError;

    return folders;
  }

  // Fetch the orders to create the folders
  const { data: folders, error: foldersError } = await client
    .from('orders_v2')
    .select('title, uuid')
    .eq('client_organization_id', clientOrganizationId);

  if (foldersError) throw foldersError;

  return folders;
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

export async function getMainFolders(
  client: SupabaseClient,
  clientOrganizationId: string,
): Promise<FolderResponse[]> {
  const { data: folders, error } = await createFolderQuery(client)
    .select('id, name, parent_folder_id')
    .is('parent_folder_id', null)
    .eq('client_organization_id', clientOrganizationId);

  if (error) {
    console.error('Error getting main folders:', error);
    return [];
  }

  return (
    (folders as FolderData[])?.map((folder) => ({
      uuid: folder.id,
      title: folder.name,
    })) ?? []
  );
}

export async function getFolderContents(
  client: SupabaseClient,
  folderId: string,
): Promise<FolderResponse[]> {
  const { data, error } = await createFolderQuery(client)
    .select(
      `
      id,
      name,
      folders(id, name)
    `,
    )
    .eq('id', folderId)
    .single();

  if (error) {
    console.error('Error getting folder contents:', error);
    return [];
  }

  return Array.isArray(data?.folders)
    ? (data.folders as FolderData[]).map((folder) => ({
        uuid: folder.id,
        title: folder.name,
      }))
    : [];
}
