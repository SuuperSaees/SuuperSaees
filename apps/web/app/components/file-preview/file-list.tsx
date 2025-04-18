'use client';

import { useEffect } from 'react';

import type { FileUpload } from '../messages/types';
import { getFileExtension } from '../shared/file-icons';
import FileUploadCard from './file-upload-card';

interface FileListProps {
  files: FileUpload[];
  onRemoveFile: (id: string) => void;
}

export default function FileList({ files, onRemoveFile }: FileListProps) {
  // Autoscroll when new files are added
  useEffect(() => {
    const container = document.querySelector('.files-uploader-container');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [files]);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="scrollbar-on-hover files-uploader-container flex max-h-96 flex-wrap gap-2 overflow-y-auto py-2">
      {files.map((file) => (
        <FileUploadCard
          key={file.id}
          fileName={file.file.name}
          fileType={file.file.type}
          extension={getFileExtension(file.file.name)}
          fileSize={file.file.size}
          upload={file}
          onRemove={onRemoveFile}
          loadingMethod="progress"
          className="w-48"
        />
      ))}
    </div>
  );
}
