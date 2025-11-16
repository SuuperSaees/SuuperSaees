'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { FolderItem } from '../../../../../../../../apps/web/components/organization/files/hooks/use-folder-manager';

export async function downloadFiles(
    currentFolders: Array<FolderItem>
  ) {
    const client = getSupabaseServerComponentClient();
  
    if (currentFolders.length > 0) {
        const firstItem = currentFolders[0];
        const title = firstItem!.title || '';
        const uuid = firstItem!.id ?? '';
        
        if (!uuid && title) {
            const lastItem = currentFolders[currentFolders.length - 1];
            const orderUuid = lastItem!.id ?? '';
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
        
        const lastItem = currentFolders[currentFolders.length - 1];
        const lastItemUuid = lastItem!.id ?? '';
        
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
  
  
