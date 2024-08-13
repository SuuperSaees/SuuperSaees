'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { File } from '../../../../../../../../apps/web/lib/file.types';

export const createFile = async (files: File.Insert[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: fileData, error: fileError } = await client
      .from('files')
      .insert(files)
      .select();

    if (fileError) throw fileError;
    return fileData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
