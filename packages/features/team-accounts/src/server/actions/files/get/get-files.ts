'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export async function getAllFolders(
    clientOrganizationId: string
){
    const client = getSupabaseServerComponentClient();

    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

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
        .eq('agency_id', agencies?.[0]?.id ?? '');

    if (foldersWithoutOrderError) throw foldersWithoutOrderError;

    const folders = foldersWithoutOrder.map((folder) => ({
        title: folder.name,
        uuid: folder.id
    }));

    return folders;
}

export async function getFilesWithoutFolder(
    clientOrganizationId: string
){
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

    if ( userRole.account_role === 'agency_owner' || userRole.account_role === 'agency_member' || userRole.account_role === 'agency_project_manager') {
        // Fetch the agencies of the user
        const { data: agencies, error: agenciesError } = await client
            .from('accounts')
            .select('id')
            .eq('primary_owner_user_id', userData.user.id)
            .eq('is_personal_account', false);

        if (agenciesError) throw agenciesError;

        // Fetch the files without order
        const { data: filesWithoutOrder, error: filesWithoutOrderError } = await client
            .from('folder_files')
            .select('file_id')
            .eq('client_organization_id', clientOrganizationId)
            .eq('agency_id', agencies?.[0]?.id ?? '');

        if (filesWithoutOrderError) throw filesWithoutOrderError;

        // Check for associated files
        if (!filesWithoutOrder || filesWithoutOrder.length === 0) {
            return [];
        }

        // Obtain the files corresponding to the obtained IDs
        const { data: files, error: filesError } = await client
            .from('files')
            .select('url, id, name, type')
            .in('id', filesWithoutOrder.map((file) => file.file_id));
        
        if (filesError) throw filesError;

        console.log(files);
        return files;
    }

    // Fetch the files without order
    const { data: filesWithoutOrder, error: filesWithoutOrderError } = await client
        .from('folder_files')
        .select('file_id')
        .eq('client_organization_id', clientOrganizationId);

    if (filesWithoutOrderError) throw filesWithoutOrderError;

    // Check for associated files
    if (!filesWithoutOrder || filesWithoutOrder.length === 0) {
        return [];
    }

    // Obtain the files corresponding to the obtained IDs
    const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type')
        .in('id', filesWithoutOrder.map((file) => file.file_id));

    if (filesError) throw filesError;

    return files;
}


export async function getOrdersFolders(
    clientOrganizationId: string
){
    const client = getSupabaseServerComponentClient();

    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;

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


export async function getFilesByFolder(folderId: string,) {
    const client = getSupabaseServerComponentClient();


    // Checking if the folder is out of order
    const { data: foldersWithoutOrder, error: folderError } = await client
        .from('folders')
        .select('id')
        .eq('id', folderId);

    if (folderError) throw folderError;

    if (foldersWithoutOrder.length === 0) {
        // Get the IDs of the files associated with the folder
        const { data: orderFiles, error: orderFilesError } = await client
            .from('order_files')
            .select('file_id')
            .eq('order_id', folderId);

        if (orderFilesError) throw orderFilesError;

        // Check for associated files
        if (!orderFiles || orderFiles.length === 0) {
            return [];
        }

        // Obtain the files corresponding to the obtained IDs
        const { data: files, error: filesError } = await client
            .from('files')
            .select('url, id, name, type')
            .in('id', orderFiles.map((orderFile) => orderFile.file_id)); 

        if (filesError) throw filesError;

        return files;
    }


    // Get the IDs of the files associated with the folder
    const { data: folderFiles, error: folderFilesError } = await client
        .from('folder_files')
        .select('file_id')
        .eq('folder_id', folderId);

    
    if (folderFilesError) throw folderFilesError;

    // Check for associated files
    if (!folderFiles || folderFiles.length === 0) {
        return [];
    }

    // Obtain the files corresponding to the obtained IDs
    const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type')
        .in('id', folderFiles.map((folderFile) => folderFile.file_id));
    
    if (filesError) throw filesError;

    return files;
    
}
