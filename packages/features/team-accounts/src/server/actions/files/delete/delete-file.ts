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



