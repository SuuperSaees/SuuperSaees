import Image from 'next/image';

import { X } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';

import FileUploadCard from '../file-preview/file-upload-card';
import { getFileExtension } from '../shared/file-icons';
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
  const extension = getFileExtension(upload.file.name);

  return (
    <div className="group relative rounded-lg">
      <div className="flex flex-col items-center gap-2">
        
        {/* Image preview */}
        {isImage && upload.url ? (
          <div className="overflow-hidden rounded-lg">
            {onRemove && upload.id && (
              <button
                onClick={() => onRemove(upload.id)}
                className={`absolute -right-2 -top-2 z-10 rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70 ${upload.status === 'uploading' && loadingMethod === 'loading' ? 'block' : 'hidden group-hover:block'}`}
              >
                {upload.status === 'uploading' &&
                loadingMethod === 'loading' ? (
                  <Spinner className="h-3 w-3 text-white" />
                ) : (
                  <X className="h-3 w-3 text-white" />
                )}
              </button>
            )}
            <Image
              width={64}
              height={64}
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
            className="w-36"
            size="sm"
            upload={upload}
            onRemove={onRemove}
            loadingMethod={loadingMethod}
          />
        )}
      </div>
    </div>
  );
};
