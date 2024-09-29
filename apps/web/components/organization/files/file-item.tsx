import Image from 'next/image';
import { FileIcon } from 'lucide-react';
import { verifyItIsOrderFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import { useEffect, useState, useRef } from 'react';
import {   DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger, } from '@kit/ui/dropdown-menu';
import { Ban, EllipsisVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { deleteFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/delete/delete-file';
import { toast } from 'sonner';
import React from 'react';

// import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Download,
} from 'lucide-react';

// import { toast } from 'sonner';
// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@kit/ui/dialog';


interface File {
  id: string;
  name: string;
  type: string;
  url: string;
}
const FileItem = ({ file }: { file: File }) => {
  const [isOrderFile, setIsOrderFile] = useState<boolean>(false);
  const { t } = useTranslation('organizations');

  useEffect(() => {
    const checkOrderFile = async () => {
      const result = await verifyItIsOrderFile(file.id);
      setIsOrderFile(result);
    };
    checkOrderFile().catch((error) => {
      console.error('Error verifying order file:', error);
    });
  }, [file.id]);

  const deleteFileHandler = async (fileId: string, fileUrl: string) => {
    try {
      await deleteFile(fileId, fileUrl);
      toast.success(t('files.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  return (
    <div>
      <div className="flex w-[184.317px] h-[132.9px] rounded-[8.86px] bg-[#E1E2E4] items-center justify-center">
        {file.type.startsWith('image/') ? (
          <Image 
            src={file.url} 
            alt={file.id} 
            width={200} 
            height={200} 
            className="w-full h-full object-contain px-2 rounded-[8.86px]" 
            />
        ) : file.type.startsWith('video/') ? (
          <video className="w-full h-full object-contain px-2 rounded-[8.86px]" controls>
            <source src={file.url} type={file.type} />
            Your browser does not support the video tag.
          </video>
        ) : file.type === 'application/pdf' ? (
          <embed src={file.url} type="application/pdf" className="w-full h-full object-contain px-2 rounded-[8.86px]" />
        ) : (
          <FileIcon size={100} className=" px-2 rounded-[8.86px]" />
        )}
      </div>
      
      <div className='flex justify-between items-center leading-[38.55px] w-[184.317px]'>
        <div className="w-[184.317px] text-gray-900 text-[15.661px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap leading-[38.55px]">
          {file.name}
        </div>
        {!isOrderFile && 
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <EllipsisVertical 
              className='w-[20px] h-[20px] cursor-pointer text-gray-400' 
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => deleteFileHandler(file.id, file.url)}>
              {t('files.delete')}
              <DropdownMenuShortcut><Ban className='w-[20px] h-[20px]' /></DropdownMenuShortcut>
            </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        }    
      </div>
    </div>
  )
}




interface ImageDialogViewProps {
  triggerComponent: JSX.Element;
  imageContentComponent: JSX.Element;
  handleCopyLink: () => void;
  handleDownload: () => void;
  isLinkCopied: boolean;
}

export const ImageDialogView: React.FC<ImageDialogViewProps> = ({
  triggerComponent,
  imageContentComponent,
  handleCopyLink,
  handleDownload,
  isLinkCopied,
}) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && imageRef.current) {
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - left) / width) * 100;
      const y = ((event.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleImageClick = () => {
    setIsZoomedIn((prev) => !prev);
  };

  // Reset zoom when the dialog is closed
  useEffect(() => {
    const handleDialogClose = () => {
      setIsZoomedIn(false);
    };

    document.addEventListener('dialogClose', handleDialogClose);

    return () => {
      document.removeEventListener('dialogClose', handleDialogClose);
    };
  }, []);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setIsZoomedIn(false); // Reset zoom when the dialog is closed
        }
      }}
    >
      <DialogTrigger>{triggerComponent}</DialogTrigger>
        <DialogContent className="max-w-[90vw] h-[80vh] max-h-[90vh] p-8">
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          ref={containerRef}
          onMouseMove={handleMouseMove}
        >
          <div
            className="relative"
            onClick={handleImageClick}
            ref={imageRef}
            style={{
              transform: isZoomedIn
                ? `scale(2) translate(-${mousePosition.x}%, -${mousePosition.y}%)`
                : 'scale(1)',
              transformOrigin: '0 0', // Ensures zoom is relative to the top-left corner
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
            }}
          >
            {imageContentComponent}
          </div>
        </div>
        <DialogFooter className="flex w-full flex-row sm:justify-start sm:justify-between mt-auto">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-5 w-5" />
              <span>Download</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCopyLink}
            >
              {isLinkCopied ? (
                <Check className="h-[20px] w-[20px] text-green-500" />
              ) : (
                <Copy className="h-[20px] w-[20px]" />
              )}
              <span>{isLinkCopied ? 'Link copied!' : 'Copy link'}</span>
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              className="flex items-center"
            >
              <TrashIcon className="mr-2 h-5 w-5" />
              <span>Delete</span>
            </Button> */}
          </div>
          <DialogClose asChild className="ml-auto">
            <Button type="button" variant="secondary" className="ml-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default FileItem;