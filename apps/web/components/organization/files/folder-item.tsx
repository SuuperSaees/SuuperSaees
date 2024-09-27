import {   DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger, } from '@kit/ui/dropdown-menu';
import { Ban, EllipsisVertical } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { deleteFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/delete/delete-folder';
import { toast } from 'sonner';
interface FolderItemProps {
  folder: {
    title: string;
    id: string;
  };
  onClick: () => void;
  isOrderFolder?: boolean;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, onClick, isOrderFolder }) => {
  const { t } = useTranslation('organizations');

  const deleteFolderHandler = async (folderId: string) => {
    try {
      await deleteFolder(folderId);
      toast.success(t('folders.deleteSuccess'));
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  return(
    <div>
      <div
        className="flex w-[184.317px] p-[32.526px_62.644px_42.548px_63.848px] justify-center items-center rounded-[8.86px] bg-[#E1E2E4] cursor-pointer"
        onClick={onClick}
      >
        <img src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/folder-icon.svg" alt="folder" />
      </div>
      <div className='flex justify-between items-center leading-[38.55px] w-[184.317px]'>
        <div className='text-gray-900 text-[15.661px] w-[184.317px] font-semibold overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer' onClick={onClick}>
          {folder.title}
        </div>
        {!isOrderFolder && 
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <EllipsisVertical 
              className='w-[20px] h-[20px] cursor-pointer text-gray-400' 
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => deleteFolderHandler(folder.id)}>
              {t('folders.delete')}
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


export default FolderItem;