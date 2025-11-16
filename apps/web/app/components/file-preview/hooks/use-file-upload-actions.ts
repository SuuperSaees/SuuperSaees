'use client';

import { useState } from 'react';

import { FileUploadState, useFileUpload } from '~/hooks/use-file-upload';

import { generateFileId, generateFilePath } from '../utils/file-utils';

interface UseFileUploadsOptions {
  bucketName: string;
  path: string;
  filePathWithFileName?: boolean;
  onFilesSelected?: (uploads: FileUploadState[]) => void;
  onRemoveFile?: (id: string) => void;
}

export function useFileUploadActions({
  bucketName,
  path,
  filePathWithFileName,
  onFilesSelected,
  onRemoveFile,
}: UseFileUploadsOptions) {
  const [fileUploads, setFileUploads] = useState<FileUploadState[]>([]);
  const { upload, cancelUpload } = useFileUpload();

  // Helper function to add or update a file upload in the state
  const addOrUpdateFileUpload = (fileUpload: FileUploadState) => {
    setFileUploads((prevFiles) => {
      const fileExists = prevFiles.some((f) => f.id === fileUpload.id);
      if (!fileExists) {
        return [...prevFiles, fileUpload];
      }
      return prevFiles.map((f) => (f.id === fileUpload.id ? fileUpload : f));
    });
  };

  // Handle single file upload
  const handleFile = async (file: File, onComplete?: (upload: FileUploadState) => void) => {
    const fileId = generateFileId();
    
    await upload(file, fileId, {
      bucketName,
      path,
      filePath: filePathWithFileName ? generateFilePath(file.name, fileId) : undefined,
      onProgress: (_progress, updatedUpload) => {
        addOrUpdateFileUpload(updatedUpload);
        if (onComplete) {
          onComplete(updatedUpload);
        }
      },
      onError: (_, errorUpload) => {
        addOrUpdateFileUpload(errorUpload);
        if (onComplete) {
          onComplete(errorUpload);
        }
      },
    });
  };

  // Handle multiple files upload
  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    const fileUploadsToReturn: FileUploadState[] = [];

    for (const file of Array.from(files)) {
      await handleFile(file, (upload) => {
        // Update the local array for the onFilesSelected callback
        const existingIndex = fileUploadsToReturn.findIndex((f) => f.id === upload.id);
        if (existingIndex !== -1) {
          fileUploadsToReturn[existingIndex] = upload;
        } else {
          fileUploadsToReturn.push(upload);
        }
      });
    }

    if (onFilesSelected) {
      // Get the current state and combine with new uploads
      setFileUploads((currentFiles) => {
        const allFiles = [...currentFiles];
        onFilesSelected(allFiles);
        return currentFiles;
      });
    }
  };

  const handleRemoveFile = (id: string) => {
    // Cancel the actual upload
    cancelUpload(id);
    
    // Remove from local state
    setFileUploads((prevFiles) => prevFiles.filter((f) => f.id !== id));
    if (onRemoveFile) {
      onRemoveFile(id);
    }
  };

  return {
    fileUploads,
    handleFile,
    handleFiles,
    handleRemoveFile,
  };
}
