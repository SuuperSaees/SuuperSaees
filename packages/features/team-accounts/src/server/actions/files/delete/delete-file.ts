'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function deleteFile(
    file_id: string,
    file_url: string
){
    const client = getSupabaseServerComponentClient();

    const { data: fileData, error: fileError } = await client
        .from('files')
        .delete()
        .eq('id', file_id)
        .select();
    
    if (fileError) throw fileError;

    // Obtener el bucket y la ruta del archivo a partir del URL
    const bucket = 'agency_files';
    const folderPath = file_url.replace('http://127.0.0.1:54321/storage/v1/object/public/agency_files/', '').split('/').slice(0, -1).join('/') + '/';

    // Listar y eliminar todos los archivos en la carpeta
    const { data: filesInFolder, error: listError } = await client
        .storage
        .from(bucket)
        .list(folderPath)


    if (listError) throw listError;

    if (filesInFolder.length > 0) {
        const filePaths = filesInFolder.map(file => `${folderPath}${file.name}`);

        const { error: storageError } = await client
            .storage
            .from(bucket)
            .remove(filePaths);

        if (storageError) throw storageError;
    }

    return fileData;
}


export async function deleteOrderBriefFile(file_id: string) {
    // console.log('file_id', file_id);
    const client = getSupabaseServerComponentClient();

    // Obtener los datos del archivo
    const { data: fileData, error: fileError } = await client
        .from('files')
        .delete()
        .eq('id', file_id)
        .select('id, url')
        .single();
    
    if (fileError) throw fileError;

    // Obtener el bucket y la ruta del archivo a partir del URL
    const url = fileData.url;
    const urlParts = url.split('/');

    // Suponiendo que el bucket está en la URL como en el ejemplo proporcionado
    const bucket = urlParts[5]; // Cambia el índice según la posición real del bucket en la URL

    // Obtener la ruta del archivo eliminando el bucket de la URL
    const folderPath = url.replace(`http://127.0.0.1:54321/storage/v1/object/public/${bucket}/`, '').split('/').slice(0, -1).join('/') + '/';

    // Listar y eliminar todos los archivos en la carpeta
    const { data: filesInFolder, error: listError } = await client
        .storage
        .from(bucket)
        .list(folderPath);

    if (listError) throw listError;

    if (filesInFolder.length > 0) {
        const filePaths = filesInFolder.map(file => `${folderPath}${file.name}`);

        const { error: storageError } = await client
            .storage
            .from(bucket)
            .remove(filePaths);

        if (storageError) throw storageError;
    }

    console.log('fileData', fileData);

    return fileData;
}





