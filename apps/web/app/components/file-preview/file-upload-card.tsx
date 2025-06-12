import Image from 'next/image';

import { CheckCircle, X, AlertTriangle } from 'lucide-react';
import { Progress } from 'node_modules/@kit/ui/src/shadcn/progress';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/ui/utils';

import { FileUploadState } from '~/hooks/use-file-upload';

import { FileType } from '../../lib/file-types';
import { FileIcon, getFileIconColor } from '../shared/file-icons';
import { formatFileSize } from './utils/format-file-size';

interface FileUploadCardProps {
  className?: string;
  fileName: string;
  fileType: string;
  extension: string;
  fileSize?: number;
  size?: 'sm' | 'md' | 'lg';
  upload?: FileUploadState;
  onRemove?: (id: string) => void | Promise<void>;
  loadingMethod?: 'progress' | 'loading';
  showImagePreview?: boolean;
  fileCorrupted?: boolean;
  isValidating?: boolean;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  className,
  fileName,
  fileType,
  fileSize,
  extension,
  size = 'sm',
  onRemove,
  loadingMethod = 'loading',
  showImagePreview = true,
  upload,
  fileCorrupted = false,
  isValidating = false,
}) => {
  const formattedFileSize = fileSize ? 
  `${formatFileSize(fileSize * (upload?.progress ?? 0) / 100)} / ${formatFileSize(fileSize)}` 
  : '';
  const { t } = useTranslation('files');
  const isImage = fileType.startsWith('image/');

  const getStatusColor = () => {
    // File corruption takes precedence over upload status
    if (fileCorrupted) return 'border-red-200 bg-red-50';
    if (isValidating) return 'border-yellow-200 bg-yellow-50';
    
    if (loadingMethod !== 'progress') return 'border-gray-200';

    switch (upload?.status) {
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'uploading':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div
      className={cn(
        'group relative flex w-full max-w-80 flex-col gap-2 rounded-lg border p-3',
        loadingMethod === 'progress' && 'transition-all duration-300',
        getStatusColor(),
        className,
      )}
    >
      {onRemove && upload?.id && (
        <button
          onClick={() => onRemove(upload.id)}
          className={cn(
            'absolute -right-2 -top-2 z-20 rounded-full border-2 border-white p-0.5',
            'transition-all duration-200 hover:scale-110',
            loadingMethod === 'progress' && [
              upload?.status === 'error'
                ? 'bg-red-500 hover:bg-red-600'
                : upload?.status === 'success'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-800 hover:bg-gray-700',
            ],
            (!loadingMethod || loadingMethod === 'loading') && 'bg-gray-800 hover:bg-gray-700',
            'opacity-0 group-hover:opacity-100',
          )}
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}
      
      {upload?.status === 'uploading' && loadingMethod === 'loading' && (
        <div className="absolute -right-2 -top-2 z-10 rounded-full border-2 border-white bg-gray-800 p-0.5">
          <Spinner className="h-3 w-3 text-white" />
        </div>
      )}

      {fileCorrupted && (
        <div className="absolute -right-2 -top-2 z-10 rounded-full border-2 border-white bg-red-500 p-0.5">
          <AlertTriangle className="h-3 w-3 text-white" />
        </div>
      )}

      {isValidating && !fileCorrupted && (
        <div className="absolute -right-2 -top-2 z-10 rounded-full border-2 border-white bg-yellow-500 p-0.5">
          <Spinner className="h-3 w-3 text-white" />
        </div>
      )}

      <div className="flex w-full items-center justify-between gap-3">
        {showImagePreview && upload?.url && isImage ? (
          <Image
            width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
            src={upload?.url}
            alt={upload?.file.name}
            className={cn(
              size === 'sm'
                ? 'h-10 w-10'
                : size === 'md'
                  ? 'h-14 w-14'
                  : 'h-18 w-18',
              'rounded object-cover',
              upload?.status === 'uploading' &&
                loadingMethod === 'loading' &&
                'blur-[1px]',
            )}
          />
        ) : (
          <div
            className={cn(
              'flex items-center gap-2 rounded-lg p-2',
              loadingMethod === 'progress' && [
                'transition-transform duration-200',
                upload?.status === 'uploading' && 'animate-pulse',
              ],
            )}
            style={{
              backgroundColor: getFileIconColor(
                fileType as FileType,
                extension,
              ),
            }}
          >
            <FileIcon extension={extension} size={size} error={upload?.status === 'error' || fileCorrupted}/>
          </div>
        )}

        <div className="flex w-full min-w-0 flex-col gap-0.5 justify-center">
          <p
            className={cn(
              'line-clamp-1 text-sm font-medium',
              loadingMethod === 'progress' ? 'text-gray-700' : 'text-gray-600',
            )}
          >
            {fileName}
          </p>
          <p className="truncate text-xs uppercase text-gray-500">
            {fileType.length > 0 ? fileType : extension}
          </p>
          {fileSize && (
            <p className="flex items-center gap-2 text-xs text-gray-500">
              {formattedFileSize}
              {/* {upload?.status === 'uploading' &&
                loadingMethod === 'loading' && (
                  <Spinner className="h-3 w-3 text-gray-400" />
                )} */}
            </p>
          )}
        </div>
      </div>

      {loadingMethod === 'progress' && (
        <>
          <div className="flex w-full items-center justify-center gap-2">
            <Progress
              value={upload?.progress}
              className={cn(
                'transition-all duration-300',
                upload?.status === 'error'
                  ? 'bg-red-100 [&>div]:bg-red-500'
                  : upload?.status === 'success'
                    ? 'bg-green-100 [&>div]:bg-green-500'
                    : 'bg-blue-100 [&>div]:bg-blue-500',
              )}
            />
            <span
              className={cn(
                'text-xs font-medium',
                upload?.status === 'error'
                  ? 'text-red-500'
                  : upload?.status === 'success'
                    ? 'text-green-500'
                    : 'text-blue-500',
              )}
            >
              {upload?.progress}%
            </span>
          </div>

          {upload?.status === 'error' && (
            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
              <X className="h-3 w-3" /> {t('upload.error')}
            </span>
          )}
          {upload?.status === 'success' && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-500">
              <CheckCircle className="h-3 w-3" />
              {t('upload.success')}
            </span>
          )}
        </>
      )}

      {/* File corruption/validation status */}
      {fileCorrupted && (
        <div className="flex items-center gap-1 text-xs font-medium text-red-500">
          {/* <AlertTriangle className="h-3 w-3" /> */}
          {t('corrupted', 'File corrupted or inaccessible')}
        </div>
      )}
      
      {isValidating && !fileCorrupted && (
        <div className="flex items-center gap-1 text-xs font-medium text-yellow-600">
          {/* <Spinner className="h-3 w-3" /> */}
          {t('validating', 'Validating file...')}
        </div>
      )}
    </div>
  );
};

export default FileUploadCard;
