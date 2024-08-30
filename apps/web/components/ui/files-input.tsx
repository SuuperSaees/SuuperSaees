"use client";

import React, { useEffect, useRef, useState } from 'react';



import { CheckSquare, CloudUpload, StickyNote } from 'lucide-react';

// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import {
  createFile,
  createUploadBucketURL,
} from '../../../../packages/features/team-accounts/src/server/actions/files/create/create-file';
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
  // const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {},
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragMessage, setDragMessage] = useState(
    'Arrastra los archivos o dale click aquí para subir archivos',
  );
  const [fileIds, setFileIds] = useState<string[]>([]);

  const handleFileInputClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      setError('Debes seleccionar al menos un archivo');
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    setError(null);
    console.log('WARN', selectedFiles);
    for (const file of selectedFiles) {
      await uploadFile(file);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    if (droppedFiles.length === 0) {
      setError('Debes seleccionar al menos un archivo');
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    setError(null);

    for (const file of droppedFiles) {
      await uploadFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
    setDragMessage('Suelta aquí para subir los archivos');
  };

  const handleDragLeave = () => {
    setIsDragging(false);
    setDragMessage(
      'Arrastra los archivos o dale click aquí para subir archivos',
    );
  };

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const uploadFile = async (file: File) => {
    const sanitizedFileName = sanitizeFileName(file.name);
    const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: progress,
        }));
      }
    });

    xhr.upload.addEventListener('error', () => {
      setError(`Error al subir el archivo ${file.name}`);
    });

    xhr.upload.addEventListener('load', () => {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 100,
      }));
      // Automatically remove the file from the list when the upload is complete
      removeResults &&
        setTimeout(() => {
          setFiles((prevFiles) =>
            prevFiles.filter((f) => f.name !== file.name),
          );
          setUploadProgress((prev) => {
            const { [file.name]: _, ...rest } = prev;
            return rest;
          });
        }, 1000); // Delay to let the user see the 100% state
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) {
          setError(`Error al subir el archivo ${file.name}: ${xhr.statusText}`);
        }
      }
    };

    const data = await createUploadBucketURL(bucketName, filePath).catch(
      (error) => {
        setError(`Error al obtener la URL de carga: ${error.message}`);
        throw error;
      },
    );
    console.log('sigened', data.signedUrl);
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
      // message_id: 'a1499927-5483-4b70-934c-7316e7b36d96',
    };

    const createdFiles = await createFile([newFileData]);

    // const orderFilesToInsert = createdFiles.map((createdFile) => ({
    //   order_id: uuid,
    //   file_id: createdFile.id,
    // }));

    // console.log('orderFilesToInsert', orderFilesToInsert);

    // const { error: orderFilesError } = await supabase
    //   .from('order_files')
    //   .insert(orderFilesToInsert);

    // if (orderFilesError) throw orderFilesError.message;

    setFileIds((prevFileIds) => {
      const newFileIds = [
        ...prevFileIds,
        ...createdFiles.map((file) => file.id),
      ];
      onFileIdsChange(newFileIds);
      return newFileIds;
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

  // Reference to the container for auto-scroll
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when files change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [files]);

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
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
        />
      </div>
      <div
        className="thin-scrollbar max-h-52 overflow-y-auto"
        ref={containerRef}
      >
        {files.map((file, index) => (
          <div
            key={index}
            className={`relative flex items-start gap-1.5 self-stretch rounded-xl border bg-white p-4 ${error ? 'border-error' : 'border-gray-200'}`}
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
                <div className="flex-1">
                  <Progress
                    value={uploadProgress[file.name] ?? 0}
                    className="w-full"
                  />
                </div>
                <span className="font-inter text-sm font-normal leading-5 text-gray-600">
                  {Math.round(uploadProgress[file.name] ?? 0)}%
                </span>
                {/* Add other conditional for show the trash or ERROR icon when the upload is not completed and error is produced */}
                {uploadProgress[file.name] === 100 ? (
                  <div className="absolute right-4 top-4">
                    <CheckSquare className="text-brand" />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}