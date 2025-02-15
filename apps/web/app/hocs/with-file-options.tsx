import React, { ComponentType } from 'react';

import { Check, Copy, Download, Eye, MoreVertical } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@kit/ui/dialog';

import Tooltip from '~/components/ui/tooltip';

import FilePreview from '../components/file-preview/file-preview';
import { useFileActions } from '../hooks/use-file-actions';

interface FileProps {
  src: string;
  fileName: string;
  fileType: string;
  className?: string;
  dialogClassName?: string;
  bucketName?: string;
  isDialog?: boolean;
  isLoading?: boolean;
}

export const withFileOptions = <P extends FileProps>(
  WrappedComponent: ComponentType<P>,
) => {
  const WithFileOptions: React.FC<P> = (props) => {
    const {
      isLinkCopied,
      isMenuOpen,
      canPreview,
      handleCopyLink,
      handleDownload,
      handleToggleMenu,
    } = useFileActions({
      src: props.src,
      fileName: props.fileName,
      fileType: props.fileType,
      bucketName: props.bucketName,
    });

    return (
      <div className="group/file-options relative inline-block flex h-full max-h-[2000px] min-w-[150px] items-center justify-center overflow-hidden">
        <FileDialogView
          triggerComponent={
            <>
              <WrappedComponent {...props} />
              <div className="absolute right-0 top-0 flex items-center">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleMenu();
                  }}
                  className="p-2 text-black sm:hidden"
                >
                  <MoreVertical className="h-6 w-6" />
                </button>

                <div
                  className={`${
                    isMenuOpen ? 'flex' : 'hidden'
                  } absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 sm:right-0 sm:top-0 sm:flex-row sm:items-center sm:group-hover/file-options:flex`}
                >
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

                  {canPreview && (
                    <Tooltip content="View">
                      <DialogTrigger asChild>
                        <button className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm">
                          <Eye className="h-[15px] w-[15px]" />
                        </button>
                      </DialogTrigger>
                    </Tooltip>
                  )}

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
            </>
          }
          {...props}
          onDownload={handleDownload}
        />
      </div>
    );
  };

  return WithFileOptions;
};

interface FileDialogViewProps extends FileProps {
  triggerComponent: React.ReactNode;
  onDownload?: () => void;
}

const FileDialogView: React.FC<FileDialogViewProps> = ({
  triggerComponent,
  onDownload,
  ...props
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{triggerComponent}</DialogTrigger>
      <DialogContent className="h-[90vh] w-[90vw] p-8">
        <div className="flex h-[calc(90vh-10rem)] w-full items-center justify-center overflow-auto">
          <FilePreview
            {...props}
            className="h-full max-h-full w-full max-w-full overflow-visible [&>img]:h-auto [&>img]:max-w-full [&>img]:object-contain"
            isDialog
            onDownload={onDownload}
            renderAs="inline"
          />
        </div>
        <div className="mt-auto flex w-full justify-between">
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={onDownload}
          >
            <Download className="h-5 w-5" />
            Download
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default withFileOptions;
