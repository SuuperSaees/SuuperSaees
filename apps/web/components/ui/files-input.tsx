import React, { useEffect, useRef, useState } from 'react';
import { CheckSquare, CloudUpload, StickyNote, Trash2, XIcon } from 'lucide-react';
import { createFile, createUploadBucketURL } from '../../../../packages/features/team-accounts/src/server/actions/files/create/create-file';
import { Progress } from '../../../../packages/ui/src/shadcn/progress';
import { useTranslation } from 'react-i18next';
import { deleteOrderBriefFile } from '~/team-accounts/src/server/actions/files/delete/delete-file';

const fileTypeColors: Record<string, string> = {
  pdf: 'fill-pdf',
  png: 'fill-png',
  jpg: 'fill-jpg',
  jpeg: 'fill-jpeg',
  doc: 'fill-doc',
  docx: 'fill-docx',
};

interface FileInfo {
  file: File;
  serverId?: string;
  progress: number;
  error?: string;
}

interface UploadFileComponentProps {
  bucketName: string;
  uuid: string;
  onFileIdsChange: (fileIds: string[]) => void;
  removeResults?: boolean;
  toggleExternalUpload?: () => void;
}

export default function UploadFileComponent({
  bucketName,
  uuid,
  onFileIdsChange,
  removeResults = false,
  toggleExternalUpload,
}: UploadFileComponentProps) {
  const { t } = useTranslation();
  const [files, setFiles] = useState<Record<string, FileInfo>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragMessage, setDragMessage] = useState(t('dragAndDrop'));
  
  const handleFileInputClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      setFiles((prevFiles) => ({ ...prevFiles, '': { file: null, progress: 0, error: t('selectFile') } }));
      return;
    }
    const newFiles = selectedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = { file, progress: 0 };
      return acc;
    }, {} as Record<string, FileInfo>);
    setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }));
    for (const [id, fileInfo] of Object.entries(newFiles)) {
      await uploadFile(id, fileInfo.file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) {
      setFiles((prevFiles) => ({ ...prevFiles, '': { file: null, progress: 0, error: t('selectFile') } }));
      return;
    }
    const newFiles = droppedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = { file, progress: 0 };
      return acc;
    }, {} as Record<string, FileInfo>);
    setFiles((prevFiles) => ({ ...prevFiles, ...newFiles }));
    for (const [id, fileInfo] of Object.entries(newFiles)) {
      await uploadFile(id, fileInfo.file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragMessage(t('orders:dropHere'));
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setDragMessage(t('orders:dragAndDrop'));
  };

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
      };

      const createdFiles = await createFile([newFileData]);
      setFiles((prevFiles) => {
        const updatedFiles = {
          ...prevFiles,
          [id]: { ...prevFiles[id], serverId: createdFiles[0].id },
        };
        // Llamar a onFileIdsChange con todos los IDs de servidor actualizados
        const allServerIds = Object.values(updatedFiles)
          .map(file => file.serverId)
          .filter(Boolean);
        onFileIdsChange(allServerIds);
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
      onFileIdsChange(Object.values(rest).map(file => file.serverId).filter(Boolean));
      return rest;
    });
    if (files[id]?.serverId) {
      const deletedFile = await deleteOrderBriefFile(files[id].serverId);
      console.log('deletedFile', deletedFile);
    }
  };

  const getFileTypeClass = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
    return fileTypeColors[extension] ?? 'fill-unknown';
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [files]);

  return (
    <div className="flex flex-col gap-2">
      <button onClick={toggleExternalUpload} className="self-end">
        <XIcon className="h-4 w-4" />
      </button>
      <div
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 ${isDragging ? 'bg-gray-300' : 'bg-gray-100'} `}
        onClick={handleFileInputClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mb-[12px] flex h-[40px] w-[40px] items-center justify-center rounded-lg border border-gray-200 p-2">
          <CloudUpload className="h-[20px] w-[20px] text-gray-600" />
        </div>
        <p className="text-sm text-gray-600">{dragMessage}</p>
        <input
          type="file"
          id="file-input"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </div>
      <div ref={containerRef} className="overflow-y-auto flex flex-col gap-2 max-h-[240px] thin-scrollbar">
        {Object.entries(files).map(([id, fileInfo]) => (
          <div
            key={id}
            className={`relative flex items-start gap-1.5 self-stretch rounded-xl border bg-white p-4 ${fileInfo.error ? 'border-error' : 'border-gray-200'}`}
          >
            <div className="relative flex items-center justify-center">
              <StickyNote
                className={`text-white ${getFileTypeClass(fileInfo.file.name)} h-[56px] w-[40px]`}
              />
              <span className="absolute inset-0 flex items-end justify-center py-4 text-[9px] font-semibold text-white">
                {fileInfo.file.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-inter text-sm font-medium leading-5 text-gray-700">
                {fileInfo.file.name}
              </span>
              <span className="font-inter truncate text-sm font-normal leading-5 text-gray-600">
                {formatFileSize(fileInfo.file.size)}
              </span>
              <div className="mt-2 flex items-center gap-2">
                {fileInfo.error ? (
                  <>
                    <div className='flex flex-col'>
                      <div className="flex-1 text-red-500">
                        Try again
                      </div>
                      <div className='text-red-500 text-sm'>
                        {fileInfo.error}
                      </div>
                    </div>
                    <div className="absolute right-4 top-4">
                      <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(id)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <Progress value={fileInfo.progress ?? 0} className="w-full" />
                    </div>
                    <span className="font-inter text-sm font-normal leading-5 text-gray-600">
                      {Math.round(fileInfo.progress ?? 0)}%
                    </span>
                    {fileInfo.progress === 100 && (
                      <div className="absolute right-4 top-4 flex gap-4">
                        <CheckSquare className="text-primary" />
                        <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(id)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}