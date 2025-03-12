import { cn } from '@kit/ui/utils';

import { FileType } from '../../lib/file-types';
import { FileIcon, getFileIconColor } from '../shared/file-icons';

interface FileUploadCardProps {
  className?: string;
  fileName: string;
  fileType: string;
  extension: string;
  size?: 'sm' | 'md' | 'lg';
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  className,
  fileName,
  fileType,
  extension,
  size = 'sm',
}) => {
  return (
    <div
      className={cn(
        'flex w-full max-w-80 items-center gap-3 rounded-lg border border-gray-200 p-4',
        className,
      )}
    >
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
        <p className="truncate text-xs text-gray-500 uppercase">{fileType.length > 0 ? fileType : extension}</p>
      </div>
    </div>
  );
};

export default FileUploadCard;
