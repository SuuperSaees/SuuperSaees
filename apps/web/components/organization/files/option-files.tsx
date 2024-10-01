'use client';

import { useState, useRef } from 'react';
import { Button } from '@kit/ui/button';
import { Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createFile, createUploadBucketURL } from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { createFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/create/create-folder';
import { downloadFiles } from 'node_modules/@kit/team-accounts/src/server/actions/files/download/download-files';
import { CheckIfItIsAnOrderFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/get/get-folders';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function OptionFiles({ clientOrganizationId, currentPath }: { clientOrganizationId: string, currentPath: Array<{ title: string; uuid?: string }> }) {
  const { t } = useTranslation('organizations');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const showDropdown = !(currentPath.length > 0 && currentPath[0]?.uuid === '');

  const sanitizeFileName = (fileName: string) => {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  };

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

  
        const fileData = await createFile(
          [{
            name: sanitizedFileName,
            size: selectedFile.size,
            type: selectedFile.type,
            url: fileUrl,
          }],
          clientOrganizationId,
          currentPath, 
        );

      if (!fileData) {
        throw new Error('No se pudo crear la entrada en la base de datos');
      }

      toast.success(t('files.new.uploadSuccess'));
      window.location.reload();
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
        const isOrderFolder = await CheckIfItIsAnOrderFolder(lastFolder!.uuid! ?? '');
  
        if (isOrderFolder) {
          toast.error(t('folders.new.cannotCreateInOrderFolder'));
          setFolderName('');
          setDialogOpen(false);
          return;
        }
  
        const folderData = await createFolder(folderName, clientOrganizationId, true, currentPath);
  
        if (!folderData) {
          toast.error(t('folders.new.error'));
          return;
        }
  
        toast.success(t('folders.new.successSubfolder', { folderName, lastPath: lastFolder?.title }));
        window.location.reload();
      } else {
        const folderData = await createFolder(folderName, clientOrganizationId);
  
        if (!folderData) {
          toast.error(t('folders.new.error'));
          return;
        }
  
        toast.success(t('folders.new.success', { folderName }));
        setDialogOpen(false);
        setFolderName('');
        window.location.reload();
      }
  
      setDialogOpen(false);
      setFolderName('');
    } catch (error) {
      toast.error(t('folders.new.error'));
      console.error('Error during folder creation:', error);
    }
  };

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


const handleDownloadFiles = async (currentPath: Array<{ title: string; uuid?: string }> ) => { 
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
    <div className='flex space-x-[16px]'>
      <Button variant='ghost'>
        <div className='flex items-center' onClick={() => handleDownloadFiles(currentPath)}>
          <Download className='w-[20px] h-[20px] mr-[4px]' />
          {t('files.download_files')}
        </div>
      </Button>


      {showDropdown && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className='bg-brand'>
                <div className='flex items-center'>
                  <Plus className='w-[20px] h-[20px] mr-[4px]' />
                  {t('files.new.title')}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-56'>
              <DropdownMenuGroup>
                <DropdownMenuItem className='cursor-pointer' onClick={triggerFileInput}>
                  {t('files.new.file')}
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer' onClick={() => setDialogOpen(true)}>
                  {t('files.new.folder')}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            className='hidden'
          />

          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('folders.new.folder')}</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <input
                  type='text'
                  placeholder={t('folders.new.name')}
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className='w-full p-2 border border-gray-300 rounded-md'
                />
              </div>
              <DialogFooter>
                <Button variant='ghost' onClick={() => setDialogOpen(false)}>
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
