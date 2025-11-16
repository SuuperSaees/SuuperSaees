import React from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, EllipsisVertical } from 'lucide-react';
import { deleteFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/delete/delete-folder';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { FolderItem as FolderItemType } from './hooks/use-folder-manager';

interface FolderItemProps {
  folder: FolderItemType;
  onClick: () => void;
  isOrderFolder?: boolean;
  queryKey: string[];
}

const FolderItem: React.FC<FolderItemProps> = ({
  folder,
  onClick,
  isOrderFolder,
  queryKey,
}) => {
  const { t } = useTranslation('organizations');

  const queryClient = useQueryClient();

  const deleteFolderHandler = useMutation({
    mutationFn: ({ folderId }: { folderId: string }) => deleteFolder(folderId),

    onSuccess: async () => {
      toast.success(t('folders.deleteSuccess'));
      // const lastFolder = currentPath[currentPath.length - 1];

      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });

    },

    onError: () => {
      console.error('Error deleting file');
      toast.error(t('folders.deleteError'));
    },
  });

  return (
    <div>
      <div
        className="flex w-[184.317px] cursor-pointer items-center justify-center rounded-[8.86px] bg-[#E1E2E4] p-[32.526px_62.644px_42.548px_63.848px]"
        onClick={onClick}
      >
        <img
          src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/folder-icon.svg"
          alt="folder"
        />
      </div>
      <div className="flex w-[184.317px] items-center justify-between leading-[38.55px]">
        <div
          className="w-[184.317px] cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-[15.661px] font-semibold text-gray-900"
          onClick={onClick}
        >
          {folder.title === 'Projects' ? t('orders:title') : folder.title}
        </div>
        {!isOrderFolder && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EllipsisVertical className="h-[20px] w-[20px] cursor-pointer text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    deleteFolderHandler.mutate({ folderId: folder.id })
                  }
                >
                  {t('folders.delete')}
                  <DropdownMenuShortcut>
                    <Ban className="h-[20px] w-[20px]" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default FolderItem;
