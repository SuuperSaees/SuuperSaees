'use client';

import { useState, useRef } from 'react';
import { Button } from '@kit/ui/button';
import { Download, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createFile, createUploadBucketURL } from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { createFolder } from 'node_modules/@kit/team-accounts/src/server/actions/folders/create/create-folder';
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

export function OptionFiles({ clientOrganizationId }: { clientOrganizationId: string }) {
  const { t } = useTranslation('organizations');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [folderName, setFolderName] = useState('');

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

      if (!urlData ?? !urlData.signedUrl) {
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
          clientOrganizationId 
        );

      if (!fileData) {
        throw new Error('No se pudo crear la entrada en la base de datos');
      }

      toast.success(`File uploaded successfully`);
      window.location.reload();
    } catch (error) {
      toast.error('Error during upload');
      console.error('Error during upload:', error);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCreateFolder = () => {
    if (folderName.trim() === '') {
      toast.error('Folder name cannot be empty');
      return;
    }

    const folderData = createFolder(
      folderName,
      clientOrganizationId,
    );

    if (!folderData) {
      toast.error('Error creating folder');
      return;
    }

    
    toast.success(`Folder "${folderName}" created successfully`);
    setDialogOpen(false); 
    setFolderName(''); 
    window.location.reload();
  };

  return (
    <div className='flex space-x-[16px]'>
      <Button variant='ghost'>
        <div className='flex items-center'>
          <Download className='w-[20px] h-[20px] mr-[4px]' />
          {t('files.download_files')}
        </div>
      </Button>

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
    </div>
  );
}
