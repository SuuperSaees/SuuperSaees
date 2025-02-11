import { X } from 'lucide-react';

import { FileUpload } from './types';

interface FileUploadPreviewProps {
  upload: FileUpload;
  onRemove: (id: string) => void;
}

export const FileUploadPreview = ({
  upload,
  onRemove,
}: FileUploadPreviewProps) => {
  const isImage = upload.file.type.startsWith('image/');

  return (
    <div className="relative rounded-lg group">
      <button
        onClick={() => onRemove(upload.id)}
        className="absolute -right-1 -top-2 rounded-full bg-gray-800/50 p-1 hover:bg-gray-800/70 group-hover:block hidden"
      >
        <X className="h-2 w-2 text-white" />
      </button>

      <div className="flex flex-col items-center gap-2">
        {isImage && upload.previewUrl ? (
          <img
            src={upload.previewUrl}
            alt={upload.file.name}
            className="h-20 w-20 rounded object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded bg-gray-100">
            <span className="text-sm text-gray-500">
              {upload.file.name.split('.').pop()}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {/* <span className="text-sm font-medium">{upload.file.name}</span> */}
          {upload.status === 'uploading' && (
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
