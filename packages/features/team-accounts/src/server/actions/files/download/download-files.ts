'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export async function downloadFiles(
    currentPath: Array<{ title: string; uuid?: string }>
  ) {
    const client = getSupabaseServerComponentClient();
  
    if (currentPath.length > 0) {
        const firstItem = currentPath[0];
        const title = firstItem!.title || '';
        const uuid = firstItem!.uuid ?? '';
        
        if (!uuid && title) {
            const lastItem = currentPath[currentPath.length - 1];
            const orderUuid = lastItem!.uuid ?? '';
            if (!orderUuid) {
                return;
            } else {
                const { data: files, error: filesError } = await client
                .from('order_files')
                .select('file_id')
                .eq('order_id', orderUuid);
                
                if (filesError) throw filesError;
                
                if (files.length === 0) {
                    return;
                }
                
                const fileIds = files.map((file) => file.file_id);
                
                const { data: filesData, error: filesDataError } = await client
                .from('files')
                .select('url')
                .in('id', fileIds);
                
                if (filesDataError) throw filesDataError;
                
                return filesData;
            }
        }
        
        const lastItem = currentPath[currentPath.length - 1];
        const lastItemUuid = lastItem!.uuid ?? '';
        
        const { data: folderFiles, error: folderFilesError } = await client
            .from('folder_files')
            .select('file_id')
            .eq('folder_id', lastItemUuid);
        
        if (folderFilesError) throw folderFilesError;

        if (folderFiles.length === 0) {
            return;
        }

        const fileIds = folderFiles.map((file) => file.file_id);

        const { data: filesData, error: filesDataError } = await client
            .from('files')
            .select('url')
            .in('id', fileIds);
        
        if (filesDataError) throw filesDataError;

        return filesData;
  
    } else {
        const { data: filesWithoutFolder, error: filesWithoutFolderError } = await client
            .from('folder_files')
            .select('file_id')
            .is('folder_id', null); 
        if (filesWithoutFolderError) throw filesWithoutFolderError;

        if (filesWithoutFolder.length === 0) {
            return;
        }

        const fileIds = filesWithoutFolder.map((file) => file.file_id);

        const { data: files, error: filesError } = await client
            .from('files')
            .select('url')
            .in('id', fileIds);

        if (filesError) throw filesError;

        if (files.length === 0) {
            return;
        }

        return files;
    }
  }
  
  
