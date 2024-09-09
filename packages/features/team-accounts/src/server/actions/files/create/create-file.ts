'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { File } from '../../../../../../../../apps/web/lib/file.types';

type CreateFileProps = Omit<File.Insert, 'user_id'>;
export const createFile = async (files: CreateFileProps[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const filesToInsert = files.map((file) => ({
      ...file,
      user_id: userData.user.id,
    }));
    const { data: fileData, error: fileError } = await client
      .from('files')
      .insert(filesToInsert)
      .select();

    if (fileError) throw fileError;
    return fileData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const createUploadBucketURL = async (
  bucketName: string,
  filePath: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: urlData, error: urlError } = await client.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);
    if (urlError) throw urlError.message;
    return urlData;
  } catch (error) {
    console.error('Error creating signed upload URL:', error);
    // throw error;
    return { error: 'Generic error message' };
  }
};