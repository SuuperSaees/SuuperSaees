import React from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileIcon } from 'lucide-react';
import { Ban, EllipsisVertical } from 'lucide-react';
import { deleteFile } from 'node_modules/@kit/team-accounts/src/server/actions/files/delete/delete-file';
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

import ImageWithOptions from '~/orders/[id]/hoc/with-image-options';

interface File {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
  url: string | undefined;
}
interface FileItemProps {
  file: File;
  currentPath: Array<{ title: string; uuid?: string }>;
}

const FileItem = ({ file, currentPath }: FileItemProps) => {
  const { t } = useTranslation('organizations');
  const showOptions =
    currentPath.length > 0 &&
    (!currentPath[0]?.uuid || currentPath[0]?.uuid === '');

  const queryClient = useQueryClient();

  const deleteFileHandler = useMutation({
    mutationFn: ({ fileId, fileUrl }: { fileId: string; fileUrl: string }) =>
      deleteFile(fileId, fileUrl),

    onSuccess: async () => {
      toast.success(t('files.deleteSuccess'));
      await queryClient.invalidateQueries({
        queryKey: ['files'],
      });
    },

    onError: () => {
      console.error('Error deleting file');
    },
  });

  return (
    <div>
      <div className="flex h-[132.9px] w-[184.317px] items-center justify-center rounded-[8.86px] bg-[#E1E2E4]">
        {file.type?.startsWith('image/') ? (
          <ImageWithOptions
            src={file.url ?? ''}
            alt="image"
            bucketName="agency_files"
          />
        ) : file.type?.startsWith('video/') ? (
          <video
            className="h-full w-full rounded-[8.86px] object-contain px-2"
            controls
          >
            <source src={file.url} type={file.type} />
            Your browser does not support the video tag.
          </video>
        ) : file.type === 'application/pdf' ? (
          <embed
            src={file.url}
            type="application/pdf"
            className="h-full w-full rounded-[8.86px] object-contain px-2"
          />
        ) : (
          <FileIcon size={100} className="rounded-[8.86px] px-2" />
        )}
      </div>

      <div className="flex w-[184.317px] items-center justify-between leading-[38.55px]">
        <div className="w-[184.317px] overflow-hidden text-ellipsis whitespace-nowrap text-[15.661px] font-semibold leading-[38.55px] text-gray-900">
          {file.name}
        </div>
        {!showOptions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <EllipsisVertical className="h-[20px] w-[20px] cursor-pointer text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() =>
                    deleteFileHandler.mutate({
                      fileId: file.id ?? '',
                      fileUrl: file.url ?? '',
                    })
                  }
                >
                  {t('files.delete')}
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

export default FileItem;
