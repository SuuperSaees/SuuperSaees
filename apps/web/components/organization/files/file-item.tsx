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

import ImageWithOptions from '~/(main)/orders/[id]/hoc/with-image-options';
import { FileActionButtons } from './file-action-buttons';
import { FolderItem } from './hooks/use-folder-manager';

interface File {
  id: string | undefined;
  name: string | undefined;
  type: string | undefined;
  url: string | undefined;
}
interface FileItemProps {
  file: File;
  currentFolders: Array<FolderItem>;
}


const FileContentWrapper: React.FC<{ url: string; children: React.ReactNode }> = ({
  url,
  children,
}) => (
  <>
    {children}
    <FileActionButtons url={url}>
      {React.cloneElement(children as React.ReactElement<{ className: string }>, {
        className: 'max-h-full max-w-full object-contain',
      })}
    </FileActionButtons>
  </>
);

const FileItem = ({ file, currentFolders }: FileItemProps) => {
  const { t } = useTranslation('organizations');
  const showOptions =
    currentFolders.length > 0 &&
    (!currentFolders[0]?.id || currentFolders[0]?.id === '');

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

  const renderFileContent = () => {
    if (file.type?.startsWith('image/')) {
      return (
        <ImageWithOptions
          src={file.url ?? ''}
          alt="image"
          bucketName="agency_files"
        />
      );
    }

    if (file.type?.startsWith('video/')) {
      return (
        <FileContentWrapper url={file.url ?? ''}>
          <video
            className="h-full w-full rounded-[8.86px] object-contain px-2"
            controls
          >
            <source src={file.url} type={file.type} />
            Your browser does not support the video tag.
          </video>
        </FileContentWrapper>
      );
    }

    if (file.type === 'application/pdf') {
      return (
        <FileContentWrapper url={file.url ?? ''}>
          <embed
            src={file.url}
            type="application/pdf"
            className="h-full w-full rounded-[8.86px] object-contain px-2"
          />
        </FileContentWrapper>
      );
    }

    return (
      <FileContentWrapper url={file.url ?? ''}>
        <FileIcon size={100} className="rounded-[8.86px] px-2" />
      </FileContentWrapper>
    );
  };

  return (
    <div>
      <div className="group relative flex h-[132.9px] w-[184.317px] items-center justify-center rounded-[8.86px] bg-[#E1E2E4]">
        {renderFileContent()}
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
