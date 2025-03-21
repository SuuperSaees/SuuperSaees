import { X } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';

import { FileUpload } from './types';
import FileUploadCard from '../file-preview/file-upload-card';
import { getFileExtension } from '../shared/file-icons';

interface FileUploadPreviewProps {
  upload: FileUpload;
  onRemove: (id: string) => void;
  loadingMethod?: 'progress' | 'loading';
}

export const FileUploadPreview = ({
  upload,
  onRemove,
  loadingMethod = 'loading',
}: FileUploadPreviewProps) => {
  const isImage = upload.file.type.startsWith('image/');
  const extension = getFileExtension(upload.file.name);

  return (
    <div className="group relative rounded-lg">
      <button
        onClick={() => onRemove(upload.id)}
        className={`absolute -right-2 -top-2 z-10 rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70 ${upload.status === 'uploading' && loadingMethod === 'loading' ? 'block' : 'group-hover:block hidden '}`}
      >
        {upload.status === 'uploading' && loadingMethod === 'loading' ? (
          <Spinner className="h-3 w-3 text-white" />
        ) : (
          <X className="h-3 w-3 text-white" />
        )}
      </button>

      <div className="flex flex-col items-center gap-2">
        {isImage && upload.url ? (
          <div className="relative rounded-lg overflow-hidden">
            <img
              src={upload.url}
              alt={upload.file.name}
              className={`h-16 w-16 rounded object-cover ${upload.status === 'uploading' && loadingMethod === 'loading' ? 'blur-[1px]' : ''}`}
            />
          </div>
        ) : (
          <FileUploadCard
            fileName={upload.file.name}
            fileType={upload.file.type}
            extension={extension}
            className="w-36 h-16"
            size="sm"
          />
        )}

        {upload.status === 'uploading' && loadingMethod === 'progress' && (
          <div className="h-1.5 w-32 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${upload.progress}%` }}
            />
          </div>
        )}
        {upload.status === 'error' && (
          <span className="text-xs text-red-500">Upload failed</span>
        )}
      </div>
    </div>
  );
};
