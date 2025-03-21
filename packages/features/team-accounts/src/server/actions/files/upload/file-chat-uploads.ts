import { useState } from 'react';
import {  createUploadBucketURL, insertFilesInFolder } from '../create/create-file';
import { useTranslation } from 'react-i18next';
import { deleteFile } from '../delete/delete-file';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface FileWithServerId {
  file: File;
  serverId?: string;
  url?: string;
  progress?: number;
  error?: string;
}

interface UseFileUploadProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onFileUploadStatusUpdate?: (file: File, status: 'uploading' | 'completed' | 'error', serverId?: string) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
  agencyId: string;
  clientOrganizationId: string;
  folderId: string;
  referenceId?: string;
}

export const useFileUpload = ({
  onFileSelect,
  onFileIdsChange,
  onFileUploadStatusUpdate,
  thereAreFilesUploaded,
  agencyId,
  clientOrganizationId,
  folderId,
  referenceId
}: UseFileUploadProps) => {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<File[]>([]);
  const [globalFileList, setGlobalFileList] = useState<FileWithServerId[]>([]);
  const {workspace: userWorkspace} = useUserWorkspace();
  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const uploadFile = async (file: File) => {
    onFileUploadStatusUpdate?.(file, 'uploading');

    setGlobalFileList(prevList => [
      ...prevList,
      {
        file,
        progress: 0,
      }
    ]);

    const bucketName = 'orders';
    const uuid = crypto.randomUUID();
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, progress } : prevFile
        ));
        if (progress < 90) {
          setGlobalFileList((prevList) => prevList.map((prevFile) =>
            prevFile.file === file ? { ...prevFile, progress } : prevFile
          ));
        }
      }
    });

    xhr.upload.addEventListener('error', () => {
      onFileUploadStatusUpdate?.(file, 'error');
      setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
        prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) } : prevFile
      ));
    });

    xhr.upload.addEventListener('load', () => {
      setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
        prevFile === file ? { ...prevFile, progress: 100 } : prevFile
      ));
      setGlobalFileList((prevList) => prevList.map((prevFile) =>
        prevFile.file === file ? { ...prevFile, progress: 99 } : prevFile
      ));
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) {
          onFileUploadStatusUpdate?.(file, 'error');
          try {
            const response = JSON.parse(xhr.responseText);
            const errorMessage = response.message || 'Unknown error';
            setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
              prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) + `: ${errorMessage}` } : prevFile
            ));
          } catch (e) {
            setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
              prevFile === file ? { ...prevFile, error: t('orders:uploadError', { fileName: file.name }) + `: ${xhr.statusText}` } : prevFile
            ));
          }
        }
      }
    };

    try {
      const data = await createUploadBucketURL(bucketName, filePath);
      if ('error' in data) {
        onFileUploadStatusUpdate?.(file, 'error');
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, error: `Error to obtain the URL: ${data.error}` } : prevFile
        ));
        return;
      }

      xhr.open('PUT', data.signedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      const fileUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/orders/' + filePath;
      
      const newFileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
        user_id: userWorkspace.id ?? '',
        reference_id: referenceId,
      };

      const createdFiles = await insertFilesInFolder(folderId, [newFileData], clientOrganizationId, agencyId);
      if (onFileSelect) {

        const allServerIds = createdFiles.map((file) => file.id);
        onFileSelect(allServerIds);
        if (onFileIdsChange) {
          onFileIdsChange(allServerIds);
        }
      }

      setFileUrls((prevFiles) => [
        ...prevFiles,
        { ...file, serverId: createdFiles[0]?.id, url: createdFiles[0]?.url }
      ]);

      onFileUploadStatusUpdate?.(file, 'completed', createdFiles[0]?.id);

      setGlobalFileList((prevList) => prevList.map((prevFile) =>
        prevFile.file === file ? { 
          ...prevFile, 
          serverId: createdFiles[0]?.id, 
          url: createdFiles[0]?.url,
          progress: 100,
        } : prevFile
      ));

    } catch (error) {
      onFileUploadStatusUpdate?.(file, 'error');
      setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
        prevFile === file ? { ...prevFile, error: t('orders:uploadURLError', { error: (error as Error).message }) } : prevFile
      ));
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setFileUrls((prevFiles) => [...prevFiles, ...newFiles]);
      
      newFiles.forEach((file) => {
        uploadFile(file).catch((error) => {
          console.error('Error uploading file', error);
        });
      });
    }
    if (thereAreFilesUploaded) {
      thereAreFilesUploaded(true);
    }
  };

  const removeFile = async (fileToRemove: File) => {
    setSelectedFiles((prevFiles) => 
      prevFiles.filter((item) => item !== fileToRemove)
    );

    if (globalFileList.find((item) => item.file === fileToRemove)) {
      setGlobalFileList((prevList) =>
        prevList.filter((item) => item.file !== fileToRemove)
      );
      await deleteFile(
        globalFileList.find((item) => item.file === fileToRemove)?.serverId ?? '',
        globalFileList.find((item) => item.file === fileToRemove)?.url ?? ''
      );
    }
  };

  const resetFiles = () => {
    setSelectedFiles([]);
    setFileUrls([]);
    setGlobalFileList([]);
    if (thereAreFilesUploaded) {
      thereAreFilesUploaded(false);
    }
  };

  return {
    selectedFiles,
    globalFileList,
    handleFileChange,
    removeFile,
    resetFiles
  };
};
