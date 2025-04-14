import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { deleteOrderBriefFile } from '../delete/delete-file';
import { createFiles, createUploadBucketURL } from '../create/create-file';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface FileInfo {
  file: File;
  serverId?: string;
  progress: number;
  error?: string;
}

export function useFileUpload(bucketName: string, uuid: string, onFileIdsChange: (fileIds: string[], fileUrls?: string[]) => void, removeResults: boolean) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const {workspace: userWorkspace} = useUserWorkspace();

  const generateFileId = () => Date.now() + Math.random().toString(36).substr(2, 9);

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const uploadFile = async (id: string, file: File) => {
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setFiles((prevFiles) => ({
          ...prevFiles,
          [id]: { ...prevFiles[id], progress },
        }));
      }
    });

    xhr.upload.addEventListener('error', () => {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [id]: { ...prevFiles[id], error: t('orders:uploadError', { fileName: file.name }) },
      }));
    });

    xhr.upload.addEventListener('load', () => {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [id]: { ...prevFiles[id], progress: 100 },
      }));
      if (removeResults) {
        setTimeout(() => {
          setFiles((prevFiles) => {
            const { [id]: _, ...rest } = prevFiles;
            return rest;
          });
        }, 1000);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            const errorMessage = response.message || 'Unknown error';
            setFiles((prevFiles) => ({
              ...prevFiles,
              [id]: { ...prevFiles[id], error: t('orders:uploadError', { fileName: file.name }) + `: ${errorMessage}` },
            }));
          } catch (e) {
            setFiles((prevFiles) => ({
              ...prevFiles,
              [id]: { ...prevFiles[id], error: t('orders:uploadError', { fileName: file.name }) + `: ${xhr.statusText}` },
            }));
          }
        }
      }
    };

    try {
      const data = await createUploadBucketURL(bucketName, filePath);
      if ('error' in data) {
        setFiles((prevFiles) => ({
          ...prevFiles,
          [id]: { ...prevFiles[id], error: `Error to obtain the URL: ${data.error}` },
        }));
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
      };

      const createdFiles = await createFiles([newFileData]);
      setFiles((prevFiles) => {
        const updatedFiles = {
          ...prevFiles,
          [id]: { ...prevFiles[id], serverId: createdFiles[0]?.id, url: createdFiles[0]?.url },
        };
        const allServerIds = Object.values(updatedFiles)
          .map(file => file.serverId)
          .filter(Boolean);
        const allFileUrls = Object.values(updatedFiles)
          .map(file => file.url)
          .filter(Boolean);
        onFileIdsChange(allServerIds, allFileUrls);
        return updatedFiles;
      });
    } catch (error) {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [id]: { ...prevFiles[id], error: t('orders:uploadURLError', { error: error.message }) },
      }));
    }
  };

  const handleDelete = async (id: string) => {
    setFiles((prevFiles) => {
      const { [id]: _, ...rest } = prevFiles;
      onFileIdsChange(Object.values(rest).map(file => file.serverId).filter(Boolean), Object.values(rest).map(file => file?.url).filter(Boolean));
      return rest;
    });
    if (files[id]?.serverId) {
      const deletedFile = await deleteOrderBriefFile(files[id].serverId);
      if (deletedFile) {
        toast(t('orders:deletedFile'), {
          description: t('orders:deletedFileDescription'),
        });
      }
    }
  };

  return { files, setFiles, uploadFile, handleDelete, generateFileId };
}