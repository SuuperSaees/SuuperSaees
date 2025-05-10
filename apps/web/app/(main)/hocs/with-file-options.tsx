import React, { ComponentType } from 'react';

import dynamic from 'next/dynamic';

import { Check, Copy, Download, Eye, MoreVertical } from 'lucide-react';

import Tooltip from '~/components/ui/tooltip';
import { File } from '~/lib/file.types';

import { useFileActions } from '../../hooks/use-file-actions';

const AnnotationsDialog = dynamic(
  () => import('~/(annotations)/components/dialog'),
  {
    ssr: false,
  },
);

const FileDialogView = dynamic(
  () => import('../../components/file-preview/file-dialog-view'),
  {
    ssr: false,
  },
);

export enum FileViewerMode {
  DEFAULT = 'default',
  ANNOTATIONS = 'annotations',
}
interface FileProps {
  fileId: string;
  src: string;
  fileName: string;
  fileType: string;
  files: File.Type[];
  className?: string;
  dialogClassName?: string;
  bucketName?: string;
  isDialog?: boolean;
  isLoading?: boolean;
  viewerMode?: FileViewerMode;
}

export const withFileOptions = <P extends FileProps>(
  WrappedComponent: ComponentType<Omit<P, 'viewerMode'>>,
) => {
  const WithFileOptions: React.FC<P> = ({
    viewerMode = FileViewerMode.DEFAULT,
    ...props
  }) => {
    return (
      <div className="group/file-options relative inline-block flex h-full max-h-[2000px] min-w-[150px] items-center justify-center overflow-hidden">
        <WrappedComponent {...props} />
        <FileOptions
          fileId={props.fileId}
          viewerMode={viewerMode}
          fileName={props.fileName}
          fileType={props.fileType}
          files={props.files}
          src={props.src}
          bucketName={props.bucketName}
        />
      </div>
    );
  };

  return WithFileOptions;
};

type FileOptionsProps = Omit<FileProps, 'dialogClassName' | 'className'>;

const FileOptions = ({
  fileId,
  viewerMode,
  fileName,
  fileType,
  files,
  src,
  bucketName,
}: FileOptionsProps) => {
  const {
    isLinkCopied,
    isMenuOpen,
    // canPreview,
    handleCopyLink,
    handleDownload,
    handleToggleMenu,
  } = useFileActions({
    src,
    fileName,
    fileType,
    bucketName,
  });
  return (
    <div className="absolute right-0 top-0 flex items-center">
      {/* Responsive button */}
      <button
        onClick={(event) => {
          event.stopPropagation();
          handleToggleMenu();
        }}
        className="p-2 text-black sm:hidden"
      >
        <MoreVertical className="h-6 w-6" />
      </button>

      {/* Desktop menu */}
      <div
        className={`${
          isMenuOpen ? 'flex' : 'hidden'
        } absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 sm:right-0 sm:top-0 sm:flex-row sm:items-center sm:group-hover/file-options:flex`}
      >
        {/* Copy link */}
        <Tooltip content="Copy link">
          <button
            className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
            onClick={(event) => {
              event.stopPropagation();
              handleCopyLink().catch(console.error);
            }}
          >
            {isLinkCopied ? (
              <Check className="h-[15px] w-[15px] text-green-500" />
            ) : (
              <Copy className="h-[15px] w-[15px]" />
            )}
          </button>
        </Tooltip>

        {/* Visualization of the file */}
        { viewerMode === FileViewerMode.ANNOTATIONS ? (
          <AnnotationsDialog
            fileId={fileId}
            triggerComponent={<TriggerComponent />}
            fileName={fileName}
            fileType={fileType}
            files={files}
          />
        ) : (
          <FileDialogView
            triggerComponent={<TriggerComponent />}
            fileName={fileName}
            fileType={fileType}
            src={src}
            onDownload={handleDownload}
          />
        )}

        {/* Download */}
        <Tooltip content="Download">
          <button
            className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
            onClick={(event) => {
              event.stopPropagation();
              handleDownload().catch(console.error);
            }}
          >
            <Download className="h-[15px] w-[15px]" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

const TriggerComponent = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
    >
      <Tooltip content="View">
        <Eye className="h-[15px] w-[15px]" />
      </Tooltip>
    </button>
  );
});
TriggerComponent.displayName = 'TriggerComponent';

export default withFileOptions;
