'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomError, CustomResponse, HttpStatus } from '@kit/shared/response';

interface StoragePathInfo {
  bucket: string;
  path: string;
}

function parseStorageUrl(url: string): StoragePathInfo {
  const storageUrlPattern = /\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/;
  const matches = url.match(storageUrlPattern);
  
  if (!matches) {
    throw new Error('Invalid storage URL format');
  }

  return {
    bucket: matches[1],
    path: matches[2]
  };
}

export const deleteMessage = async (messageId: string, adminActived = false) => {
  try {
    const client = getSupabaseServerComponentClient({
      admin: adminActived,
    });

    const { data: files, error: filesError } = await client
      .from('files')
      .select('*')
      .eq('message_id', messageId);

    if (filesError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error fetching files: ${filesError.message}`,
        'FAILED_TO_FETCH_FILES'
      );
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const { bucket, path } = parseStorageUrl(file.url);
        
        const { error: storageError } = await client
          .storage
          .from(bucket)
          .remove([path]);

        if (storageError) {
          console.error(`Error deleting file from storage: ${storageError.message}`);
        }
      }

      const { error: deleteFilesError } = await client
        .from('files')
        .delete()
        .eq('message_id', messageId);

      if (deleteFilesError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error deleting files records: ${deleteFilesError.message}`,
          'FAILED_TO_DELETE_FILES'
        );
      }
    }

    const { error } = await client
      .from('messages')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', messageId);

    if (error) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error deleting message: ${error.message}`,
        'FAILED_TO_DELETE_MESSAGE'
      );
    }

    return CustomResponse.success(null, 'Message and associated files deleted successfully').toJSON();
  } catch (error) {
    console.error('Error deleting message:', error);
    return CustomResponse.error(error).toJSON();
  }
};
