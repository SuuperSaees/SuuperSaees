import { useRef, useState } from 'react';

import Image from 'next/image';

import { CloudUpload } from 'lucide-react';
import { Trash } from 'lucide-react';
import {
  createFiles,
  createUploadBucketURL,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { FormField, FormItem } from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { generateUUID } from '~/utils/generate-uuid';

import { BriefCreationForm } from './brief-creation-form';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

export interface UploadImageDropzoneProps {
  index: number | undefined;
  nameField:
    | `questions.${number}.label`
    | `questions.${number}.options`
    | `questions.${number}.type`
    | `questions.${number}.position`
    | `questions.${number}.description`
    | `questions.${number}.placeholder`
    | `questions.${number}.alert_message`
    | `questions.${number}.options.${number}.label`
    | `questions.${number}.options.${number}.value`
    | 'image_url'
    | 'label';
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (urlImage: string) => void;
  defaultValue?: string | null;
  handleRemove: () => void;
}

const UploadImage: React.FC<UploadImageDropzoneProps> = ({
  index,
  nameField,
  form,
  handleQuestionChange,
  defaultValue,
  handleRemove,
}) => {
  const { t } = useTranslation('briefs');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>(defaultValue ?? '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {workspace: userWorkspace} = useUserWorkspace();
  async function uploadImageToBucket(file: File) {
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

      const fileData = await createFiles([
        {
          name: sanitizedFileName,
          size: file.size,
          type: file.type,
          url: fileUrl,
          user_id: userWorkspace.id ?? '',
        },
      ]);

      if (!fileData) {
        throw new Error(t('uploadImage.databaseEntryError'));
      }

      const finalUrl = fileData[0]?.url ?? fileUrl;
      setImageUrl(finalUrl);
      handleQuestionChange(finalUrl);

      toast.success(t('uploadImage.uploadSuccess'));
    } catch (error) {
      console.error(error);
      console.error(t('uploadImage.uploadError'), error);
      toast.error(t('uploadImage.uploadError'));
      setImageUrl('');
    } finally {
      setIsUploading(false);
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      await uploadImageToBucket(selectedFile);
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
      await uploadImageToBucket(file);
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
    handleRemove();

    setImageUrl('');
    if (index !== undefined) {
      form.setValue(`questions.${index}.label`, '');
    }
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
            <div className="relative">
              <Image
                alt="Image"
                src={imageUrl ?? ''}
                width={0}
                height={0}
                className="rounded-xl"
                sizes="100vw"
                style={{ width: '100%', height: 'auto' }}
              />
              <div className="absolute right-2 top-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-8 w-8 rounded-full p-2"
                >
                  <Trash strokeWidth={1.7} className="w-full" />
                </Button>
              </div>
            </div>
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
                  placeholder={t('uploadImage.placeholder')}
                  className="pointer-events-none mb-[0.30rem] w-full border-none bg-transparent text-center text-sm font-normal text-gray-400 focus:outline-none"
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
