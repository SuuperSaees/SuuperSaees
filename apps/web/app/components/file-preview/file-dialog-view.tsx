import { Download } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from '@kit/ui/dialog';

import FilePreview from './file-preview';

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
      <DialogContent className="h-[90vh] w-[90vw] p-8 rounded-lg">
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

export default FileDialogView;
