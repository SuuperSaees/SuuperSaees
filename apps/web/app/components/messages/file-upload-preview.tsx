import { X } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';

import { FileUpload } from './types';

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
          <div className="relative">
            <img
              src={upload.url}
              alt={upload.file.name}
              className={`h-20 w-20 rounded object-cover ${upload.status === 'uploading' && loadingMethod === 'loading' ? 'blur-[1px]' : ''}`}
            />
          </div>
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100">
            <span className="text-sm text-gray-500">
              {upload.file.name.split('.').pop()}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* <span className="text-sm font-medium">{upload.file.name}</span> */}
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
    </div>
  );
};
