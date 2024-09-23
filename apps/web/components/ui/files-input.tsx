import React, { useEffect, useRef, useState } from 'react';
import { CheckSquare, CloudUpload, StickyNote, Trash2 } from 'lucide-react';
import { createFile, createUploadBucketURL } from '../../../../packages/features/team-accounts/src/server/actions/files/create/create-file';
import { Progress } from '../../../../packages/ui/src/shadcn/progress';
import { File } from '../../../web/lib/file.types';
const fileTypeColors: Record<string, string> = {
  pdf: 'fill-pdf',
  png: 'fill-png',
  jpg: 'fill-jpg',
  jpeg: 'fill-jpeg',
  doc: 'fill-doc',
  docx: 'fill-docx',
};
interface UploadFileComponentProps {
  bucketName: string;
  uuid: string;
  onFileIdsChange: (fileIds: string[]) => void;
  removeResults?: boolean;
}
export default function UploadFileComponent({
  bucketName,
  uuid,
  onFileIdsChange,
  removeResults = false,
}: UploadFileComponentProps) {
  const [filesWithId, setFilesWithId] = useState<Map<string, File>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragMessage, setDragMessage] = useState('Drag files or click here to upload files');
  const [fileIds, setFileIds] = useState<string[]>([]);
  
  const handleFileInputClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      setErrors((prevErrors) => ({ ...prevErrors, '': 'You must select at least one file' }));
      return;
    }
    const filesWithIds = selectedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = file;
      return acc;
    }, {} as Record<string, File>);
    setFilesWithId((prevFiles) => ({ ...prevFiles, ...filesWithIds }));
    setErrors((prevErrors) => ({ ...prevErrors, ...Object.fromEntries(Object.keys(filesWithIds).map(id => [id, null])) }));
    for (const [id, file] of Object.entries(filesWithIds)) {
      await uploadFile(id, file);
    }
  };
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) {
      setErrors((prevErrors) => ({ ...prevErrors, '': 'You must select at least one file' }));
      return;
    }
    const filesWithIds = droppedFiles.reduce((acc, file) => {
      const id = generateFileId();
      acc[id] = file;
      return acc;
    }, {} as Record<string, File>);
    setFilesWithId((prevFiles) => ({ ...prevFiles, ...filesWithIds }));
    setErrors((prevErrors) => ({ ...prevErrors, ...Object.fromEntries(Object.keys(filesWithIds).map(id => [id, null])) }));
    for (const [id, file] of Object.entries(filesWithIds)) {
      await uploadFile(id, file);
    }
  };
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragMessage('Drop here to upload files');
  };
  const handleDragLeave = () => {
    setIsDragging(false);
    setDragMessage('Drag files or click here to upload files');
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
        setUploadProgress((prev) => ({
          ...prev,
          [id]: progress,
        }));
      }
    });
    xhr.upload.addEventListener('error', () => {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: `Error uploading file ${file.name}`,
      }));
    });
    xhr.upload.addEventListener('load', () => {
      setUploadProgress((prev) => ({
        ...prev,
        [id]: 100,
      }));
      removeResults &&
        setTimeout(() => {
          setFilesWithId((prevFiles) => {
            const updatedFiles = { ...prevFiles };
            delete updatedFiles[id];
            return updatedFiles;
          });
          setUploadProgress((prev) => {
            const { [id]: _, ...rest } = prev;
            return rest;
          });
        }, 1000); // Delay to let the user see the 100% state
    });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) {
          try {
            const response = JSON.parse(xhr.responseText); // Parse the response as JSON
            const errorMessage = response.message || 'Unknown error'; // Extract the message
            setErrors((prevErrors) => ({
              ...prevErrors,
              [id]: `Error uploading file ${file.name}: ${errorMessage}`,
            }));
          } catch (e) {
            setErrors((prevErrors) => ({
              ...prevErrors,
              [id]: `Error uploading file ${file.name}: Failed to process server response`,
            }));
          }
        }
      }
    };
    
    
    try {
      const data = await createUploadBucketURL(bucketName, filePath);
      if ('error' in data) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [id]: `Error to obtain the URL: ${data.error}`,
        }));
        return;
      }
      xhr.open('PUT', data.signedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
      const fileUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        '/storage/v1/object/public/orders/' +
        filePath;
      const newFileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        url: fileUrl,
      };
      
      
      const createdFiles = await createFile([newFileData]);
      setFileIds((prevFileIds) => {
        const newFileIds = [
          ...prevFileIds,
          ...createdFiles.map((file) => file.id),
        ];
        onFileIdsChange(newFileIds);
        return newFileIds;
      });
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: `Error to obtain the URL`,
      }));
    }
  };
  const handleDelete = (id: string) => {
    setFilesWithId((prevFiles) => {
      const updatedFiles = { ...prevFiles };
      delete updatedFiles[id];
      return updatedFiles;
    });
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      delete updatedErrors[id];
      return updatedErrors;
    });
    setUploadProgress((prevProgress) => {
      const updatedProgress = { ...prevProgress };
      delete updatedProgress[id];
      return updatedProgress;
    });
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
  }, [filesWithId]);
  return (
    <div className="flex flex-col gap-2">
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
        {Object.entries(filesWithId).map(([id, file]) => (
          <div
            key={id}
            className={`relative flex items-start gap-1.5 self-stretch rounded-xl border bg-white p-4 ${errors[id] ? 'border-error' : 'border-gray-200'}`}
          >
            <div className="relative flex items-center justify-center">
              <StickyNote
                className={`text-white ${getFileTypeClass(file.name)} h-[56px] w-[40px]`}
              />
              <span className="absolute inset-0 flex items-end justify-center py-4 text-[9px] font-semibold text-white">
                {file.name.split('.').pop()?.toUpperCase()}
              </span>
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-inter text-sm font-medium leading-5 text-gray-700">
                {file.name}
              </span>
              <span className="font-inter truncate text-sm font-normal leading-5 text-gray-600">
                {formatFileSize(file.size)}
              </span>
              <div className="mt-2 flex items-center gap-2">
                {errors[id] ? (
                  <>
                    <div className='flex flex-col'>
                      <div className="flex-1 text-red-500">
                        Try again
                      </div>
                      <div className='text-red-500 text-sm'>
                        {errors[id]}
                      </div>
                    </div>
                    <div className="absolute right-4 top-4">
                    <Trash2 className="text-red-500 cursor-pointer" onClick={() => handleDelete(id)} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <Progress value={uploadProgress[id] ?? 0} className="w-full" />
                    </div>
                    <span className="font-inter text-sm font-normal leading-5 text-gray-600">
                      {Math.round(uploadProgress[id] ?? 0)}%
                    </span>
                    {uploadProgress[id] === 100 && (
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