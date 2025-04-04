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
  const { upload } = useFileUpload();

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;

    let fileUploadsToReturn: FileUploadState[] = [];

    for (const file of Array.from(files)) {
      const fileId = generateFileId();
      await upload(file, fileId, {
        bucketName,
        path,
        filePath: filePathWithFileName ? generateFilePath(file.name, fileId) : undefined,
        onProgress: (_progress, updatedUpload) => {
          setFileUploads((prevFiles) => {
            const fileExists = prevFiles.some((f) => f.id === fileId);
            if (!fileExists) {
              const newFileUploads = [...prevFiles, updatedUpload];
              fileUploadsToReturn = newFileUploads;
              return newFileUploads;
            }
            const updatedFileUploads = prevFiles.map((f) =>
              f.id === fileId ? updatedUpload : f,
            );
            fileUploadsToReturn = updatedFileUploads;
            return updatedFileUploads;
          });
        },
        onError: (_, errorUpload) => {
          // Add the error upload to the fileUploads array if it doesn't exist or update the existing upload
          setFileUploads((prevFiles) => {
            const fileExists = prevFiles.some((f) => f.id === errorUpload.id);
            if (!fileExists) {
              return [...prevFiles, errorUpload];
            }
            return prevFiles.map((f) => (f.id === errorUpload.id ? errorUpload : f));
          });
        },
      });
    }

    if (onFilesSelected) {
      onFilesSelected(fileUploadsToReturn);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFileUploads((prevFiles) => prevFiles.filter((f) => f.id !== id));
    if (onRemoveFile) {
      onRemoveFile(id);
    }
  };

  return {
    fileUploads,
    handleFiles,
    handleRemoveFile,
  };
}
