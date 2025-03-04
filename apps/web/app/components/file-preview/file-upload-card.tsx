import { X } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/ui/utils';

import { FileType } from '../../lib/file-types';
import { FileIcon, getFileIconColor } from '../shared/file-icons';

interface FileUploadCardProps {
  className?: string;
  fileName: string;
  fileType: string;
  extension: string;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onRemove?: () => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  className,
  fileName,
  fileType,
  extension,
  size = 'sm',
  isLoading = false,
  onRemove,
}) => {
  return (
    <div
      className={cn(
        'group/upload relative flex w-full max-w-80 items-center gap-3 rounded-lg border border-gray-200 p-4',
        className,
      )}
    >
      {isLoading && (
        <button className="absolute -right-2 -top-2 z-[100] rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70">
          <Spinner className="h-3 w-3 text-white" />
        </button>
      )}
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -right-2 -top-2 z-[200] hidden rounded-full border border-2 border-white bg-gray-800/100 p-0.5 hover:bg-gray-800/70 group-hover/upload:block"
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}

      <div
        className="flex items-center gap-2 rounded-lg p-2"
        style={{
          backgroundColor: getFileIconColor(fileType as FileType, extension),
        }}
      >
        <FileIcon extension={extension} size={size} />
      </div>
      <div className="flex w-full min-w-0 flex-col">
        <p className="line-clamp-1 text-sm font-medium text-gray-500">
          {fileName}
        </p>
        <p className="truncate text-xs uppercase text-gray-500">
          {fileType.length > 0 ? fileType : extension}
        </p>
      </div>
    </div>
  );
};

export default FileUploadCard;
