"use client";

import React, { useState } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { StickyNote, CloudUpload } from 'lucide-react';
import { Progress } from '../../../../packages/ui/src/shadcn/progress';
import { File } from '../../../web/lib/file.types';
import { createFile } from '../../../../packages/features/team-accounts/src/server/actions/files/create/create-file';

const fileTypeColors: Record<string, string> = {
  'pdf': 'fill-pdf',
  'png': 'fill-png',
  'jpg': 'fill-jpg',
  'jpeg': 'fill-jpeg',
  'doc': 'fill-doc',
  'docx': 'fill-docx',
};

interface UploadFileComponentProps {
  bucketName: string;
  uuid: string;
  onFileIdsChange: (fileIds: string[]) => void;
}

export default function UploadFileComponent({ bucketName, uuid, onFileIdsChange }: UploadFileComponentProps) {
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragMessage, setDragMessage] = useState('Arrastra los archivos o dale click aquí para subir archivos');
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
      setError('Debes seleccionar al menos un archivo');
      return;
    }

    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setError(null);

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

    setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
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
    setDragMessage('Arrastra los archivos o dale click aquí para subir archivos');
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
          [file.name]: progress
        }));
      }
    });

    xhr.upload.addEventListener('error', () => {
      setError(`Error al subir el archivo ${file.name}`);
    });

    xhr.upload.addEventListener('load', () => {
      setUploadProgress((prev) => ({
        ...prev,
        [file.name]: 100
      }));
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status !== 200) {
          setError(`Error al subir el archivo ${file.name}: ${xhr.statusText}`);
        }
      }
    };

    const { data, error } = await supabase.storage.from(bucketName).createSignedUploadUrl(filePath);

    if (error) {
      setError(`Error al obtener la URL de carga: ${error.message}`);
      return;
    }

    xhr.open('PUT', data.signedUrl, true);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);

    const fileUrl = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/orders/' + filePath;

    const newFileData = {
      name: file.name,
      size: file.size,
      type: file.type as File.Type['type'],
      url: fileUrl,
    };

    const createdFiles = await createFile([newFileData]);

    const orderFilesToInsert = createdFiles.map((createdFile) => ({
      order_id: uuid,
      file_id: createdFile.id,
    }));

    console.log('orderFilesToInsert', orderFilesToInsert);

    // const { error: orderFilesError } = await supabase
    //   .from('order_files')
    //   .insert(orderFilesToInsert);

    // if (orderFilesError) throw orderFilesError.message;

    setFileIds((prevFileIds) => {
      const newFileIds = [...prevFileIds, ...createdFiles.map(file => file.id)];
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

  return (
    <div className='flex flex-col gap-2'>
      <div
        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer ${isDragging ? 'bg-gray-300' : 'bg-gray-100'}`}
        onClick={handleFileInputClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className='border border-gray-200 rounded-lg w-[40px] h-[40px] items-center flex justify-center p-2 mb-[12px]'>
            <CloudUpload className='text-gray-600 w-[20px] h-[20px]' />
        </div>
        <p className="text-gray-600 text-sm">
          {dragMessage}
        </p>
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
        />
      </div>

      {files.map((file, index) => (
        <div key={index} className="flex p-4 items-start gap-1.5 self-stretch rounded-xl border border-gray-200 bg-white"> 
          <div className="relative flex items-center justify-center">
            <StickyNote 
              className={`text-white ${getFileTypeClass(file.name)} w-[40px] h-[56px]`} 
            /> 
            <span 
              className="absolute inset-0 flex items-end justify-center text-[9px] font-semibold py-4 text-white"
            >
              {file.name.split('.').pop()?.toUpperCase()}
            </span>
          </div>
          <div className='flex flex-col flex-1'>
            <span className="text-gray-700 text-sm font-medium leading-5 font-inter">{file.name}</span>
            <span className="truncate text-gray-600 text-sm font-normal leading-5 font-inter">{formatFileSize(file.size)}</span>
            <div className='flex items-center gap-2 mt-2'>
              <div className='flex-1'>
                <Progress value={uploadProgress[file.name] ?? 0} className="w-full" />
              </div>
              <span className="text-gray-600 text-sm font-normal leading-5 font-inter">
                {Math.round(uploadProgress[file.name] ?? 0)}%
              </span>
            </div>
          </div>
        </div>
      ))}

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
