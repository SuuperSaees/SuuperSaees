'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export async function deleteFile(file_id: string, file_url: string) {
  const client = getSupabaseServerComponentClient();

  const { data: fileData, error: fileError } = await client
    .from('files')
    .delete()
    .eq('id', file_id)
    .select('url')
    .single();

  if (fileError) throw fileError;

  // Get bucket and file path from URL
  const url = fileData.url ? fileData.url : file_url;
  const urlParts = url.split('/');

  const bucket = urlParts[7];

  const baseUrlFolderPath =
    process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/';
  const folderPath =
    file_url.replace(baseUrlFolderPath, '').split('/').slice(0, -1).join('/') +
    '/';

  // List and delete all files in the folder
  const { data: filesInFolder, error: listError } = await client.storage
    .from(bucket)
    .list(folderPath);

  if (listError) throw listError;

  if (filesInFolder.length > 0) {
    const filePaths = filesInFolder.map((file) => `${folderPath}${file.name}`);

    const { error: storageError } = await client.storage
      .from(bucket)
      .remove(filePaths);

    if (storageError) throw storageError;
  }

  return fileData;
}

export async function deleteOrderBriefFile(file_id: string) {
  const client = getSupabaseServerComponentClient();

  // Get data from file
  const { data: fileData, error: fileError } = await client
    .from('files')
    .delete()
    .eq('id', file_id)
    .select('id, url')
    .single();

  if (fileError) throw fileError;

  // Get bucket and file path from URL
  const url = fileData.url;
  const urlParts = url.split('/');

  const bucket = urlParts[7];

  const baseUrlFolderPath =
    process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/';

  // Get file path by removing the base URL
  const filePath = url.replace(`${baseUrlFolderPath}${bucket}/`, '');

  // Delete the specific file
  const { error: storageError } = await client.storage
    .from(bucket)
    .remove([filePath]);

  if (storageError) throw storageError;

  return fileData;
}
