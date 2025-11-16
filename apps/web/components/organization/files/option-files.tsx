'use client';

import { useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import {
  createUploadBucketURL,
  insertFilesInFolder,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { downloadFiles } from 'node_modules/@kit/team-accounts/src/server/actions/files/download/download-files';
import { createFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/create/create-folder';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';

import { generateUUID } from '~/utils/generate-uuid';
import { FolderItem } from './hooks/use-folder-manager';
import { Folder } from '~/lib/folder.types';
import { Spinner } from '@kit/ui/spinner';
export function OptionFiles({
  clientOrganizationId,
  agencyId,
  userId,
  currentFolders,
  queryKey,
  currentFolderId,
}: {
  clientOrganizationId: string;
  agencyId: string;
  userId: string;
  currentFolders: Array<FolderItem>;
  queryKey: string[];
  currentFolderId: string;
}) {
  const { t } = useTranslation('organizations');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const showDropdown = !(
    currentFolders.length > 0 &&
    (!currentFolders[0]?.id || currentFolders[0]?.id === '')
  );

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const queryClient = useQueryClient();


  const insertSubFolder = useMutation({
    mutationFn: ({parentFolderId, folder}: {parentFolderId: string, folder: Folder.Insert}) => createFolder({
      ...folder,
      parent_folder_id: parentFolderId,
    }),

    onSuccess: async () => {
      const lastFolder = currentFolders[currentFolders.length - 1];
      toast.success(
        t('folders.new.successSubfolder', {
          folderName,
          lastPath: lastFolder?.title,
        }),
      );

      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },

    onError: () => {
      toast.error(t('folders.new.error'));
    },
  });

  const insertFile = useMutation({
    mutationFn: ({
      files,
      clientOrganizationId,
      agencyId,
    }: {
      files: Array<{ name: string; size: number; type: string; url: string, user_id: string }>;
      clientOrganizationId: string;
      agencyId: string;
    }) => {
      return insertFilesInFolder(currentFolderId, files, clientOrganizationId, agencyId)
    },

    onSuccess: async () => {
      toast.success(t('files.new.uploadSuccess'));

      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },

    onError: () => {
      toast.error(t('files.new.error'));
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (!selectedFile) return;
    try {
      const uuid = generateUUID();
      const sanitizedFileName = sanitizeFileName(selectedFile.name);
      const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
      const bucketName = 'agency_files';
      const urlData = await createUploadBucketURL(bucketName, filePath);

      if (!urlData || 'error' in urlData || !urlData.signedUrl) {
        throw new Error('No se pudo generar la URL de subida');
      }

      const uploadResponse = await fetch(urlData.signedUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Error al subir el archivo a Supabase Storage');
      }

      const fileUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        '/storage/v1/object/public/agency_files/' +
        filePath;

      const fileData = await insertFile.mutateAsync({
        files: [
          {
            name: sanitizedFileName,
            size: selectedFile.size,
            type: selectedFile.type,
            url: fileUrl,
            user_id: userId,
          },
        ],
        clientOrganizationId,
        agencyId,
      });

      if (!fileData) {
        throw new Error('No se pudo crear la entrada en la base de datos');
      }
    } catch (error) {
      toast.error(t('files.new.error'));
      console.error('Error during upload:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreateFolder = async () => {
    if (folderName.trim() === '') {
      toast.error(t('folders.new.emptyName'));
      return;
    }

    try {
      if (currentFolders.length > 0) {
    


        await insertSubFolder.mutateAsync({
          parentFolderId: currentFolderId,
          folder: {
            name: folderName,
            client_organization_id: clientOrganizationId,
            agency_id: agencyId,
            is_subfolder: true,
          },
        });
      } 

      setDialogOpen(false);
      setFolderName('');
    } catch (error) {
      toast.error(t('folders.new.error'));
      console.error('Error during folder creation:', error);
    }
  };
  // revalidate
  const downloadFile = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = objectUrl;

      link.download = url.split('/').pop() ?? 'downloaded-file';
      link.click();

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(`Error downloading file from ${url}:`, error);
    }
  };

  const handleDownloadFiles = async (
    currentFolders: Array<FolderItem>,
  ) => {
    try {
      const files = await downloadFiles(currentFolders);
      for (const file of files!) {
        await downloadFile(file.url);
      }
    } catch (error) {
      toast.error(t('files.download_error'));
      console.error('Error during download:', error);
    }
  };

  return (
    <div className="flex space-x-[16px]">
      <Button variant="ghost">
        <div
          className="flex items-center"
          onClick={() => handleDownloadFiles(currentFolders)}
        >
          <Download className="mr-[4px] h-[20px] w-[20px]" />
          {t('files.download_files')}
        </div>
      </Button>

      {showDropdown && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <ThemedButton>
                <div className="flex items-center">
                  <Plus className="mr-[4px] h-[20px] w-[20px]" />
                  {t('files.new.title')}
                </div>
              </ThemedButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuGroup>
                {currentFolders.length > 0 && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    {t('files.new.file')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setDialogOpen(true)}
                >
                  {t('files.new.folder')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('folders.new.folder')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('folders.new.name')}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                  {t('folders.new.cancel')}
                </Button>
                <Button onClick={handleCreateFolder} disabled={insertSubFolder.isPending}>
                  {t('folders.new.accept')}
                  {
                    insertSubFolder.isPending && (
                      <Spinner className="ml-2 h-4 w-4" />
                    )
                  }
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
