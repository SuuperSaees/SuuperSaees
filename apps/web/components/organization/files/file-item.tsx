import Image from 'next/image';
import { FileIcon } from 'lucide-react';
import { verifyItIsOrderFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/get/get-files';
import { useEffect, useState } from 'react';
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
          <Image src={file.url} alt={file.id} width={200} height={200} className="w-full h-full object-contain px-2 rounded-[8.86px]" />
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

export default FileItem;