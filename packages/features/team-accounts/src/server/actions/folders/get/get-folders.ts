'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export async function getAllFolders(
    clientOrganizationId: string
){
    const client = getSupabaseServerComponentClient();

    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

    if (userData.user.role === 'agency_owner' || userData.user.role === 'agency_member' || userData.user.role === 'agency_project_manager') {
        // Fecth the agencies of the user
        const { data: agencies, error: agenciesError } = await client
            .from('accounts')
            .select('id')
            .eq('primary_owner_user_id', userData.user.id)
            .eq('is_personal_account', false);

        if (agenciesError) throw agenciesError;

        // Fetch the folders without order 
        const { data: foldersWithoutOrder, error: foldersWithoutOrderError } = await client
            .from('folders')
            .select('name, id')
            .eq('client_organization_id', clientOrganizationId)
            .eq('agency_id', agencies?.[0]?.id ?? '')
            .eq('is_subfolder', false);
            ;

        if (foldersWithoutOrderError) throw foldersWithoutOrderError;

        const folders = foldersWithoutOrder.map((folder) => ({
            title: folder.name,
            uuid: folder.id
        }));

        return folders;
    }


    // Fetch the folders without order
    const { data: foldersWithoutOrder, error: foldersWithoutOrderError } = await client
        .from('folders')
        .select('name, id')
        .eq('client_organization_id', clientOrganizationId)
        .eq('is_subfolder', false);
        ;
    
    if (foldersWithoutOrderError) throw foldersWithoutOrderError;

    const folders = foldersWithoutOrder.map((folder) => ({
        title: folder.name,
        uuid: folder.id
    }));

    return folders;
}



export async function getOrdersFolders(
    clientOrganizationId: string
){
    const client = getSupabaseServerComponentClient();

    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;


    if (userData.user.role === 'agency_owner' || userData.user.role === 'agency_member' || userData.user.role === 'agency_project_manager') {
        // Fecth the agencies of the user
        const { data: agencies, error: agenciesError } = await client
        .from('accounts')
        .select('id')
        .eq('primary_owner_user_id', userData.user.id)
        .eq('is_personal_account', false);

        if (agenciesError) throw agenciesError;

        // Fetch the orders to create the folders 
        const { data: folders, error:  foldersError} = await client
            .from('orders_v2')
            .select('title, uuid')
            .eq('agency_id', agencies?.[0]?.id ?? '')
            .eq('client_organization_id', clientOrganizationId);

        if (foldersError) throw foldersError;

        return folders;
    }

    // Fetch the orders to create the folders 
    const { data: folders, error:  foldersError} = await client
        .from('orders_v2')
        .select('title, uuid')
        .eq('client_organization_id', clientOrganizationId);
    
    if (foldersError) throw foldersError;

    return folders;
}

export async function getFoldersByFolder(
    folderUuid: string
){
    const client = getSupabaseServerComponentClient();

    // Fetch the folders within the selected folder
    const { data: folders, error: foldersError } = await client
        .from('folders')
        .select('name, id')
        .eq('parent_folder_id', folderUuid);

    if (foldersError) throw foldersError;

    return folders;
}

export async function CheckIfItIsAnOrderFolder(
    folderUuid: string
){
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