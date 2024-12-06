import React, { forwardRef, useState, useImperativeHandle, useRef, useEffect } from 'react';
import { StickyNote, X } from 'lucide-react';
import { createFile, createUploadBucketURL } from '~/team-accounts/src/server/actions/files/create/create-file';
import { useTranslation } from 'react-i18next';
import { generateUUID } from '~/utils/generate-uuid';

interface FileUploaderProps {
  onFileSelect?: (fileIds: string[]) => void;
  onFileIdsChange?: (fileIds: string[]) => void;
  onMessageSend?: boolean;
  onFileUploadStatusUpdate?: (file: File, status: 'uploading' | 'completed' | 'error', serverId?: string) => void;
  thereAreFilesUploaded?: (value: boolean) => void;
}

interface FileWithServerId {
  file: File;
  serverId?: string;
  url?: string;
  progress?: number;
  error?: string;
}

const fileTypeColors: Record<string, string> = {
  pdf: 'fill-pdf',
  png: 'fill-png',
  jpg: 'fill-jpg',
  jpeg: 'fill-jpeg',
  doc: 'fill-doc',
  docx: 'fill-docx',
};

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFileSelect, onFileIdsChange, onMessageSend, onFileUploadStatusUpdate, thereAreFilesUploaded  }, ref) => {
    const { t } = useTranslation();
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
    const [fileUrls, setFileUrls] = useState<File[]>([]); 
    const inputRef = useRef<HTMLInputElement>(null);
    const [hoveredFileId, setHoveredFileId] = useState<number | null>(null);
    const uuid = generateUUID();

    useImperativeHandle(ref, () => inputRef.current!);

    const sanitizeFileName = (fileName: string) => {
      return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

    const uploadFile = async (id: string, file: File) => {
      onFileUploadStatusUpdate?.(file, 'uploading');

      const bucketName = 'orders';
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
      const xhr = new XMLHttpRequest();
  
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
            prevFile === file ? { ...prevFile, progress } : prevFile
          ));
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
        };

        const createdFiles = await createFile([newFileData]);
        setFileUrls((prevFiles) => [
          ...prevFiles,
          { ...file, serverId: createdFiles[0]?.id, url: createdFiles[0]?.url }
        ]);

        onFileUploadStatusUpdate?.(file, 'completed', createdFiles[0]?.id);
        
        if (onFileSelect) {
          const allServerIds = createdFiles.map((file) => file.id);
          onFileSelect(allServerIds);
          if (onFileIdsChange){
            onFileIdsChange(allServerIds);
          }
        }
      } catch (error) {
        onFileUploadStatusUpdate?.(file, 'error');
        setFileUrls((prevFiles) => prevFiles.map((prevFile) =>
          prevFile === file ? { ...prevFile, error: t('orders:uploadURLError', { error: error.message }) } : prevFile
        ));
      }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        const newFiles = Array.from(files);
        setSelectedFiles((prevFiles) => [...prevFiles, ...newFiles]);
        setFileUrls((prevFiles) => [...prevFiles, ...newFiles]);
        
    
        // Llama a uploadFile para cada archivo seleccionado
        newFiles.forEach((file) => {
          const uniqueId = `${Date.now()}_${file.name}`;
          uploadFile(uniqueId, file);
        });
      }
      if (thereAreFilesUploaded){
        thereAreFilesUploaded(true);
      }
    };

    const removeFile = (fileToRemove: FileWithServerId) => {
      // Remove the file from selectedFiles
      setSelectedFiles((prevFiles) => 
        prevFiles.filter((item) => item !== fileToRemove.file)
      );

      // Collect remaining server IDs
      const remainingServerIds = selectedFiles
        .filter((item) => item !== fileToRemove.file)
        .map((item) => item.serverId)
        .filter(Boolean) as string[];

      // Call file select/change callbacks
      if (onFileSelect) {
        onFileSelect(remainingServerIds);
      }

      if (onFileIdsChange) {
        onFileIdsChange(remainingServerIds);
      }

      // Check if no files remain
      if (remainingServerIds.length === 0 && thereAreFilesUploaded) {
        thereAreFilesUploaded(false);
      }

      // Revoke object URL to free up memory
      if (fileToRemove.file.type.startsWith('image/') || fileToRemove.file.type.startsWith('video/')) {
        URL.revokeObjectURL(URL.createObjectURL(fileToRemove.file));
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

    useEffect(() => {
      if (onMessageSend) {
        setSelectedFiles([]);
        setFileUrls([]);
      }
    }, [onMessageSend]);
    
    return (
      <div className="overflow-y-auto overflow-x-hidden flex flex-wrap gap-2 max-h-[240px] w-full">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        {selectedFiles.map((file, id) => (
          <div
            key={id}
            className="relative flex flex-col items-center justify-start w-24 mt-4 m-2"
            onMouseEnter={() => setHoveredFileId(id)}
            onMouseLeave={() => setHoveredFileId(null)}
          >
            <div className="flex items-center justify-center w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="object-cover w-full h-full"
                />
              ) : file.type.startsWith('video/') ? (
                <video
                  src={URL.createObjectURL(file)}
                  className="object-cover w-full h-full"
                  muted // Desactiva el sonido por defecto
                />
              ) : (
                <StickyNote className={`text-white ${getFileTypeClass(file.name ?? 'fileName')} w-8`} />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 truncate w-24">{file.name ?? 'fileName'}</p>
              <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
            </div>
            {hoveredFileId === id && (
              <div className="absolute top-[-8px] right-[-8px]">
                <X
                  className="cursor-pointer w-4 h-4 bg-white rounded-full shadow"
                  onClick={() => removeFile(file)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

FileUploader.displayName = 'FileUploader';
export default FileUploader;
