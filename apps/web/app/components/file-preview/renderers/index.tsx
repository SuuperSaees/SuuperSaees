import React, { useEffect } from 'react';

import { Music } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/ui/utils';

import { FileType } from '../../../lib/file-types';
import { getFileExtension } from '../../shared/file-icons';
import FileUploadCard from '../file-upload-card';
import { ImageRenderer } from './image-renderer';
import { FileUploadState } from '~/hooks/use-file-upload';
import { useFileValidation } from '~/hooks/use-file-validation';

export interface FileRendererProps {
  src: string;
  fileName: string;
  fileType: string;
  className?: string;
  isDialog?: boolean;
  isLoading?: boolean;
  onDownload?: () => void;
  onRemove?: (fileId: string) => void | Promise<void>;
  renderAs?: 'card' | 'inline';
  upload?: FileUploadState;
  fileError?: boolean;
  onFileError?: (hasError: boolean) => void;
  enableValidation?: boolean;
  validationTimeout?: number;
}

export const VideoRenderer: React.FC<FileRendererProps> = ({
  src,
  fileName,
  className,
  fileType,
  renderAs = 'inline',
  upload,
  onFileError,
  enableValidation = false,
  validationTimeout = 10000,
}) => {
  const { hasError, isValidating } = useFileValidation(src, fileType, renderAs, {
    enabled: enableValidation,
    timeout: validationTimeout,
    upload,
  });

  useEffect(() => {
    onFileError?.(hasError);
  }, [hasError, onFileError]);

  if (renderAs === 'card') {
    return (
      <FileUploadCard
        fileName={fileName}
        fileType={fileType}
        extension={getFileExtension(fileName)}
        className={className}
        upload={upload}
        fileCorrupted={enableValidation ? hasError : false}
        isValidating={enableValidation ? isValidating : false}
      />
    );
  }

  return (
    <video
      src={src}
      controls
      className={`aspect-video ${className}`}
      controlsList="nodownload"
    >
      <track kind="captions" src="" label={fileName} />
      Your browser does not support the video tag.
    </video>
  );
};

export const AudioRenderer: React.FC<FileRendererProps> = ({
  src,
  fileName,
  className,
  fileType,
  renderAs = 'inline',
  upload,
  onFileError,
  enableValidation = false,
  validationTimeout = 10000,
}) => {
  const { hasError, isValidating } = useFileValidation(src, fileType, renderAs, {
    enabled: enableValidation,
    timeout: validationTimeout,
    upload,
  });

  useEffect(() => {
    onFileError?.(hasError);
  }, [hasError, onFileError]);

  if (renderAs === 'card') {
    return (
      <FileUploadCard
        fileName={fileName}
        fileType={fileType}
        extension={getFileExtension(fileName)}
        className={className}
        upload={upload}
        fileCorrupted={enableValidation ? hasError : false}
        isValidating={enableValidation ? isValidating : false}
      />
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
    >
      <Music className="h-5 w-5 text-gray-400" />
      <audio
        src={src}
        controls
        className="w-full min-w-80 max-w-full"
        controlsList="nodownload"
      >
        <track kind="captions" src="" label={fileName} />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};

export const PDFRenderer: React.FC<FileRendererProps> = ({
  src,
  fileName,
  className,
  fileType,
  renderAs = 'inline',
  upload,
  onFileError,
  enableValidation = false,
  validationTimeout = 10000,
}) => {
  const { hasError, isValidating } = useFileValidation(src, fileType, renderAs, {
    enabled: enableValidation,
    timeout: validationTimeout,
    upload,
  });

  useEffect(() => {
    onFileError?.(hasError);
  }, [hasError, onFileError]);

  if (renderAs === 'card') {
    return (
      <FileUploadCard
        fileName={fileName}
        fileType={fileType}
        extension={getFileExtension(fileName)}
        className={className}
        upload={upload}
        fileCorrupted={enableValidation ? hasError : false}
        isValidating={enableValidation ? isValidating : false}
      />
    );
  }

  return (
    <iframe
      src={src}
      className={cn('aspect-[3/4] h-full w-full', className)}
      title={fileName}
    >
      This browser does not support PDFs.
    </iframe>
  );
};

export const LoadingRenderer: React.FC<FileRendererProps> = ({ className }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Spinner className="h-8 w-8" />
  </div>
);

const UnsupportedRenderer: React.FC<FileRendererProps> = ({
  fileType,
  fileName,
  className,
  upload,
  src,
  onFileError,
  enableValidation = false,
  validationTimeout = 10000,
}) => {
  const { hasError, isValidating } = useFileValidation(src, fileType, 'card', {
    enabled: enableValidation,
    timeout: validationTimeout,
    upload,
  });

  useEffect(() => {
    onFileError?.(hasError);
  }, [hasError, onFileError]);

  return (
    <FileUploadCard
      fileName={fileName}
      fileType={fileType}
      extension={getFileExtension(fileName)}
      className={className}
      upload={upload}
      fileCorrupted={enableValidation ? hasError : false}
      isValidating={enableValidation ? isValidating : false}
    />
  );
};

export const renderers: Record<FileType, React.FC<FileRendererProps>> = {
  image: ImageRenderer,
  video: VideoRenderer,
  audio: AudioRenderer,
  pdf: PDFRenderer,
  other: UnsupportedRenderer,
  document: UnsupportedRenderer,
  spreadsheet: UnsupportedRenderer,
  presentation: UnsupportedRenderer,
};
