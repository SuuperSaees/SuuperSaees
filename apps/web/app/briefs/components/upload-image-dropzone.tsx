import { ChangeEvent, useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { CloudUpload } from 'lucide-react';
import {
  createFile,
  createUploadBucketURL,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { generateUUID } from '~/utils/generate-uuid';

import { BriefCreationForm } from './brief-creation-form';
import { Button } from '@kit/ui/button';

export interface UploadImageDropzoneProps {
  index: number;
  nameField: string;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (urlImage: string) => void;
}

const UploadImage: React.FC<UploadImageDropzoneProps> = ({
  index,
  nameField,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    handleQuestionChange(imageUrl);
  }, [imageUrl]);

  async function uploadImage(file: File) {
    if (!file) return;

    try {
      setIsUploading(true);
      const uuid = generateUUID();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const newFilepath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
      const bucketName = 'create_brief';

      const urlData = await createUploadBucketURL(bucketName, newFilepath);

      if (!urlData || 'error' in urlData || !urlData.signedUrl) {
        throw new Error(t('uploadImage.uploadUrlError'));
      }

      const uploadResponse = await fetch(urlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(t('uploadImage.uploadError'));
      }

      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/create_brief/${newFilepath}`;

      const fileData = await createFile([
        {
          name: sanitizedFileName,
          size: file.size,
          type: file.type,
          url: fileUrl,
        },
      ]);

      if (!fileData) {
        throw new Error(t('uploadImage.databaseEntryError'));
      }

      const finalUrl = fileData[0]?.url ?? fileUrl;
      setImageUrl(finalUrl);

      toast.success(t('uploadImage.uploadSuccess'));
    } catch (error) {
      console.error(error);
      console.error(t('uploadImage.uploadError'), error);
      toast.error(t('uploadImage.uploadError'));
      setImageUrl(null);
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      await uploadImage(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) {
      await uploadImage(file);
    } else {
      toast.error(t('uploadImage.invalidFileType'));
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    return url.toLowerCase() !== 'image';
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    form.setValue(`questions.${index}.label`, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <FormField
      control={form.control}
      name={nameField}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          {isValidImageUrl(imageUrl) ? (
            <>
              <Image
                alt="Image"
                src={imageUrl ?? ''}
                width={0}
                height={0}
                className="rounded-xl"
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  <Trash strokeWidth={1.5} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <div
                onClick={handleClickUpload}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={(event) => handleDrop(event)}
                className={`z-50 flex flex-col items-center justify-center rounded-xl border-[1.5px] border-slate-200 py-4 hover:bg-slate-50 ${
                  isDragging
                    ? 'border-2 border-dashed border-blue-500 opacity-70'
                    : ''
                }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  ref={fileInputRef}
                  onChange={(event) => handleFileChange(event)}
                />
                <div className="mb-3 rounded-xl border-[1.5px] border-slate-200 bg-slate-50 p-2 drop-shadow-sm">
                  {isUploading ? (
                    <Spinner className="h-6 w-6 text-gray-200" />
                  ) : (
                    <CloudUpload color="#667085" size={25} />
                  )}
                </div>
                <input
                  style={{
                    width: `100ch`,
                    backgroundColor: '#00000000',
                  }}
                  placeholder={t('uploadImage.placeholder')}
                  className="pointer-events-none mb-[0.30rem] border-none text-center text-sm font-normal text-gray-400 focus:outline-none"
                />
                <p className="pointer-events-none border-none text-center text-sm font-normal text-gray-400 focus:outline-none">
                  {t('uploadImage.fileTypes')}
                </p>
              </div>
            </div>
          )}
        </FormItem>
      )}
    />
  );
};

export default UploadImage;
