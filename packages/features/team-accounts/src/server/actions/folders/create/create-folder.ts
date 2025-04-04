'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Folder } from '../../../../../../../../apps/web/lib/folder.types';

/**
 * Creates a new folder in the database
 * @param folder - The folder data to insert
 * @returns The created folder data
 * @throws Error if folder creation fails
 */
export const createFolder = async (folder: Folder.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();

    // For now, we don't allow create root folder as
    // a unique root folder creation is triggered
    // at the creation of the organization (be either agency or client organization)
    if (!folder.parent_folder_id) {
      throw new Error('Parent folder ID is required');
    }

    const { data: folderData, error: folderError } = await client
      .from('folders')
      .insert(folder)
      .select();

    if (folderError)
      throw new Error(`Error creating folder: ${folderError.message}`);

    return folderData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
