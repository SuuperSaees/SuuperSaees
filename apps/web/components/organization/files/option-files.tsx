'use client';

import { useRef, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, Plus } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import {
  createUploadBucketURL,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { downloadFiles } from 'node_modules/@kit/team-accounts/src/server/actions/files/download/download-files';
import { createFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/create/create-folder';
import { CheckIfItIsAnOrderFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/get/get-folders';
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
import { createFile } from '~/server/actions/files/files.action';

export function OptionFiles({
  clientOrganizationId,
  currentPath,
  queryKey,
}: {
  clientOrganizationId: string;
  currentPath: Array<{ title: string; uuid?: string }>;
  queryKey: string[];
}) {
  const { t } = useTranslation('organizations');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const showDropdown = !(
    currentPath.length > 0 &&
    (!currentPath[0]?.uuid || currentPath[0]?.uuid === '')
  );

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

  const queryClient = useQueryClient();

  const insertFolder = useMutation({
    mutationFn: ({
      folderName,
      clientOrganizationId,
    }: {
      folderName: string;
      clientOrganizationId: string;
    }) => createFolder(folderName, clientOrganizationId),

    onSuccess: async () => {
      toast.success(t('folders.new.success', { folderName }));
      await queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
    onError: () => {
      toast.error(t('folders.new.error'));
    },
  });

  const insertSubFolder = useMutation({
    mutationFn: ({
      folderName,
      clientOrganizationId,
      isSubfolder,
      currentPath,
    }: {
      folderName: string;
      clientOrganizationId: string;
      isSubfolder: boolean;
      currentPath: Array<{ title: string; uuid?: string }>;
    }) =>
      createFolder(folderName, clientOrganizationId, isSubfolder, currentPath),

    onSuccess: async () => {
      const lastFolder = currentPath[currentPath.length - 1];
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
      currentPath,
    }: {
      files: Array<{ name: string; size: number; type: string; url: string }>;
      clientOrganizationId: string;
      currentPath: Array<{ title: string; uuid?: string }>;
    }) => createFile({
      files,
      client_organization_id: clientOrganizationId,
      currentPath
    }),

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
          },
        ],
        clientOrganizationId,
        currentPath,
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
      if (currentPath.length > 0) {
        const lastFolder = currentPath[currentPath.length - 1];
        const isOrderFolder = await CheckIfItIsAnOrderFolder(
          lastFolder!.uuid! ?? '',
        );

        if (isOrderFolder) {
          toast.error(t('folders.new.cannotCreateInOrderFolder'));
          setFolderName('');
          setDialogOpen(false);
          return;
        }

        await insertSubFolder.mutateAsync({
          folderName,
          clientOrganizationId,
          isSubfolder: true,
          currentPath,
        });
      } else {
        await insertFolder.mutateAsync({
          folderName,
          clientOrganizationId,
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
    currentPath: Array<{ title: string; uuid?: string }>,
  ) => {
    try {
      const files = await downloadFiles(currentPath);
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
          onClick={() => handleDownloadFiles(currentPath)}
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
                {currentPath.length > 0 && (
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
                <Button onClick={handleCreateFolder}>
                  {t('folders.new.accept')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
