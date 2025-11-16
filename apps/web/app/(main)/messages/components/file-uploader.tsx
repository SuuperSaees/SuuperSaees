'use client';

import { forwardRef, useRef } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '~/server/actions/files/files.action';

interface FileUploaderProps {
  onFileIdsChange: (fileIds: string[]) => void;
  onFileUploadStatusUpdate: (
    file: File,
    status: 'uploading' | 'completed' | 'error',
    serverId?: string
  ) => void;
  thereAreFilesUploaded: (value: boolean) => void;
  className?: string;
}

const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFileIdsChange, onFileUploadStatusUpdate, thereAreFilesUploaded, className = '' }, ref) => {
    const abortControllersRef = useRef<Map<string, AbortController>>(
      new Map()
    );

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      thereAreFilesUploaded(true);
      const fileIds: string[] = [];

      for (const file of files) {
        const controller = new AbortController();
        abortControllersRef.current.set(file.name, controller);

        try {
          onFileUploadStatusUpdate(file, 'uploading');
          
          const formData = new FormData();
          formData.append('file', file);
          
          const response = await uploadFile(formData);
          
          if (response.id) {
            fileIds.push(response.id);
            onFileUploadStatusUpdate(file, 'completed', response.id);
          } else {
            throw new Error('Failed to upload file');
          }
        } catch (error) {
          onFileUploadStatusUpdate(file, 'error');
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          abortControllersRef.current.delete(file.name);
        }
      }

      if (fileIds.length > 0) {
        onFileIdsChange(fileIds);
      }

      // Reset input
      if (e.target) {
        e.target.value = '';
      }
    };

    return (
      <input
        ref={ref}
        type="file"
        multiple
        onChange={handleFileSelect}
        className={className}
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
      />
    );
  }
);

FileUploader.displayName = 'FileUploader';

export default FileUploader;