'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { File } from '../../../../../../../../apps/web/lib/file.types';
import { CheckIfItIsAnOrderFolder } from '../../folders/get/get-folders';
import { getAgencyForClient } from '../../organizations/get/get-organizations';

type CreateFileProps = Omit<File.Insert, 'user_id'>;

// Check files in frontend where is being used
export const createFile = async (
  files: CreateFileProps[],
  client_organization_id?: string,
  currentPath?: Array<{ title: string; uuid?: string }>,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    // Fetch the current user data
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    if (client_organization_id !== undefined) {
      // Fetch the agencies of the user
      const agency = await getAgencyForClient();

      if (!agency) throw new Error('Agency not found');

      if (currentPath!.length > 0) {
        const folderUuid = currentPath![currentPath!.length - 1]?.uuid ?? '';
        const isOrderFolder = await CheckIfItIsAnOrderFolder(folderUuid);

        if (isOrderFolder) {
          return [];
        }

        // Insert the files
        const filesToInsert = files.map((file) => ({
          ...file,
          user_id: userData.user.id,
        }));

        const { data: fileData, error: fileError } = await client
          .from('files')
          .insert(filesToInsert)
          .select();

        if (fileError) throw fileError;

        const folderFilesToInsert = fileData.map((file) => ({
          file_id: file.id,
          client_organization_id,
          agency_id: agency.id,
          folder_id:
            currentPath && currentPath.length > 0
              ? currentPath[currentPath.length - 1]?.uuid
              : undefined,
        }));

        // Insert the files in folder_files table

        const canInsertFolderFiles = folderFilesToInsert.some(
          (folderFile) =>
            folderFile.folder_id !== undefined && folderFile.folder_id !== null,
        );
        if (canInsertFolderFiles) {
          const { error: folderFilesError } = await client
            .from('folder_files')
            .insert(folderFilesToInsert)
            .select();

          if (folderFilesError) throw folderFilesError;
        }

        return fileData;
      }

      // Insert the files
      const filesToInsert = files.map((file) => ({
        ...file,
        user_id: userData.user.id,
      }));

      const { data: fileData, error: fileError } = await client
        .from('files')
        .insert(filesToInsert)
        .select();

      if (fileError) throw fileError;

      const folderFilesToInsert = fileData.map((file) => ({
        file_id: file.id,
        client_organization_id,
        agency_id: agency.id,
      }));

      // Insert the files in folder_files table
      const canInsertFolderFiles = folderFilesToInsert.some(
        (folderFile) =>
          folderFile?.folder_id !== undefined && folderFile?.folder_id !== null,
      );
      if (canInsertFolderFiles) {
        const { error: folderFilesError } = await client
          .from('folder_files')
          .insert(folderFilesToInsert)
          .select();

        if (folderFilesError) throw folderFilesError;
      }

      return fileData;
    }

    // Insert the files
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

// // New function for create files => helper function

export const createFiles = async (files: File.Insert[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: filesData, error: fileError } = await client
      .from('files')
      .insert(files)
      .select();

    if (fileError)
      throw new Error(`Error creating files: ${fileError.message}`);

    return filesData;
  } catch (error) {
    console.error('Error creating files:', error);
    throw error;
  }
};

export const createFolderFiles = async (
  folderFiles: File.Relationships.FolderFiles.Insert[],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: folderFilesData, error: folderFilesError } = await client
      .from('folder_files')
      .insert(folderFiles)
      .select();

    if (folderFilesError)
      throw new Error(
        `Error creating folder files: ${folderFilesError.message}`,
      );

    return folderFilesData;
  } catch (error) {
    console.error('Error creating folder files:', error);
    throw error;
  }
};

// New function for create files in folder
/**
 * Create file for a specific folder (root or sub)
 * @param  {string} [folderId] - The ID of the folder.
 * @param {files} [files] - The files to be created.
 * @param {string} [clientOrganizationId] - The ID of the client organization.
 * @param {string} [agencyId] - The ID of the agency.
 * @returns {Promise<Array<File>>}
 */

export const insertFilesInFolder = async (
  folderId: string,
  files: File.Insert[],
  clientOrganizationId: string,
  agencyId: string,
) => {
  try {
    const filesData = await createFiles(files);

    const folderFilesToInsert = filesData.map((file) => ({
      file_id: file.id,
      client_organization_id: clientOrganizationId,
      agency_id: agencyId,
      folder_id: folderId,
    }));

    // Insert the files in folder_files table
    const canInsertFolderFiles = folderFilesToInsert.some(
      (folderFile) =>
        folderFile?.folder_id !== undefined && folderFile?.folder_id !== null,
    );
    if (canInsertFolderFiles) await createFolderFiles(folderFilesToInsert);

    return filesData;
  } catch (error) {
    console.error(`Error inseting files in folder ${folderId}`, error);
    throw error;
  }
};

export const createUploadBucketURL = async (
  bucketName: string,
  filePath: string,
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Create a signed URL for uploading a file
    const { data: urlData, error: urlError } = await client.storage
      .from(bucketName)
      .createSignedUploadUrl(filePath);
    if (urlError) throw urlError.message;

    return urlData;
  } catch (error) {
    return { error: 'Error creating signed upload URL' };
  }
};

// Check files in frontend where is being used
export const insertOrderFiles = async (orderId: string, fileId: string) => {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: orderFileData, error: orderFileError } = await client
      .from('order_files')
      .insert({
        order_id: orderId,
        file_id: fileId,
      });
    if (orderFileError) throw orderFileError.message;

    return orderFileData;
  } catch (error) {
    return { error: 'Error inserting order files' };
  }
};
