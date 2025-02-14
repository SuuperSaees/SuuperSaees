import React from 'react';
import { Spinner } from '@kit/ui/spinner';
import { File } from '~/lib/file.types';
import { withImageOptions } from '~/hocs/with-image-options';

interface UserFileProps {
  file: File.Type & {
    isLoading?: boolean;
  };
}

interface FileImageProps {
  src: string;
  alt: string;
  className?: string;
  isLoading?: boolean;
  isDialog?: boolean;
}

const FileImage: React.FC<FileImageProps> = ({ src, alt, className, isLoading }) => {
  return (
    <div className="relative">
      <img src={src} alt={alt} className={className} />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-8 w-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};

const ImageWithFileOptions = withImageOptions(FileImage);

const UserFile = ({ file }: UserFileProps) => {
  return (
    <div className="flex flex-col">
      <ImageWithFileOptions
        src={file.url}
        alt={file.name}
        className={`h-[150px] w-[150px] rounded-lg object-cover ${file.isLoading ? 'blur-[1px]' : ''}`}
        isLoading={file.isLoading}
      />
      <p className="w-[150px] truncate text-sm font-medium text-gray-400">
        {file.name ?? 'fileName'}
      </p>
    </div>
  );
};

export default UserFile;