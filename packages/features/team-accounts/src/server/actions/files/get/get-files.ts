'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

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
            .eq('agency_id', agencies?.[0]?.id ?? '')
            .is('folder_id', null);
            ;

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

    // Fetch the files without order
    const { data: filesWithoutOrder, error: filesWithoutOrderError } = await client
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
        .in('id', filesWithoutOrder.map((file) => file.file_id));

    if (filesError) throw filesError;

    return files;
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
        .select('file_id')
        .eq('client_organization_id', clientOrganizationId);

    if (fileDataError) throw fileDataError;

    // Fetch the orders of the client organization
    const { data: ordersData, error: ordersDataError } = await client
        .from('orders_v2')
        .select('uuid')
        .eq('client_organization_id', clientOrganizationId);

    if (ordersDataError) throw ordersDataError;

    // Fetch the files associated with the orders
    const { data: orderFilesData, error: orderFilesDataError } = await client
        .from('order_files')
        .select('file_id')
        .in('order_id', ordersData.map((orderData) => orderData.uuid));

    if (orderFilesDataError) throw orderFilesDataError;

    // Combine the file data
    const allFileIds = [...fileData.map(f => f.file_id), ...orderFilesData.map(f => f.file_id)];

    // Fetch file details
    const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type, user_id')
        .in('id', allFileIds);

    if (filesError) throw filesError;

    // Fetch the list of client user_ids
    const { data: clientUsers, error: clientUsersError } = await client
        .from('clients')
        .select('user_client_id');

    if (clientUsersError) throw clientUsersError;

    const clientUserIds = clientUsers.map(client => client.user_client_id);

    // Filter files that are not associated with clients
    const nonClientFiles = files.filter(file => !clientUserIds.includes(file.user_id));

    return nonClientFiles;
}


export async function getClientFiles(clientOrganizationId: string) {
    const client = getSupabaseServerComponentClient();

    // Fetch the files associated with the client organization
    const { data: fileData, error: fileDataError } = await client
        .from('folder_files')
        .select('file_id')
        .eq('client_organization_id', clientOrganizationId);

    if (fileDataError) throw fileDataError;

    // Fetch the orders of the client organization
    const { data: ordersData, error: ordersDataError } = await client
        .from('orders_v2')
        .select('uuid')
        .eq('client_organization_id', clientOrganizationId);

    if (ordersDataError) throw ordersDataError;

    // Fetch the files associated with the orders
    const { data: orderFilesData, error: orderFilesDataError } = await client
        .from('order_files')
        .select('file_id')
        .in('order_id', ordersData.map((orderData) => orderData.uuid));

    if (orderFilesDataError) throw orderFilesDataError;

    // Combine the file data
    const allFileIds = [...fileData.map(f => f.file_id), ...orderFilesData.map(f => f.file_id)];

    // Fetch file details
    const { data: files, error: filesError } = await client
        .from('files')
        .select('url, id, name, type, user_id')
        .in('id', allFileIds);

    if (filesError) throw filesError;

    // Fetch the list of client user_ids
    const { data: clientUsers, error: clientUsersError } = await client
        .from('clients')
        .select('user_client_id');

    if (clientUsersError) throw clientUsersError;

    const clientUserIds = clientUsers.map(client => client.user_client_id);

    // Filter files that are associated with clients
    const clientFiles = files.filter(file => clientUserIds.includes(file.user_id));

    return clientFiles;
}
