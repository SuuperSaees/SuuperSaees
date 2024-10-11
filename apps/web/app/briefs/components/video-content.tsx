import React, { useRef, useState } from 'react';

import { CirclePlay, X } from 'lucide-react';
import {
  createFile,
  createUploadBucketURL,
} from 'node_modules/@kit/team-accounts/src/server/actions/files/create/create-file';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { generateUUID } from '~/utils/generate-uuid';

import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface FormVideoUploadProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (index: number, field: 'label', value: string) => void;
  handleRemoveQuestion: (index: number) => void;
}

const FormVideoUpload: React.FC<FormVideoUploadProps> = ({
  index,
  form,
  handleQuestionChange,
  handleRemoveQuestion,
}) => {
  const { t } = useTranslation('briefs');
  const [videoUrl, setVideoUrl] = useState<string | null>(() => {
    const initialValue = form.getValues(`questions.${index}.label`);
    return initialValue && initialValue.toLowerCase() !== 'video'
      ? initialValue
      : null;
  });
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setSelectedFileName(file.name);

    try {
      setIsUploading(true);

      const uuid = generateUUID();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `uploads/${uuid}/${Date.now()}_${sanitizedFileName}`;
      const bucketName = 'create_brief';

      const urlData = await createUploadBucketURL(bucketName, filePath);

      if (!urlData || 'error' in urlData || !urlData.signedUrl) {
        throw new Error(t('video.uploadUrlError'));
      }

      const uploadResponse = await fetch(urlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(t('video.uploadError'));
      }

      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/create_brief/${filePath}`;

      const fileData = await createFile([
        {
          name: sanitizedFileName,
          size: file.size,
          type: file.type,
          url: fileUrl,
        },
      ]);

      if (!fileData) {
        throw new Error(t('video.databaseEntryError'));
      }

      const finalUrl = fileData[0]?.url ?? fileUrl;

      setVideoUrl(finalUrl);
      handleQuestionChange(index, 'label', finalUrl);
      form.setValue(`questions.${index}.label`, finalUrl);

      toast.success(t('video.uploadSuccess'));
    } catch (error) {
      console.error(t('video.uploadError'), error);
      toast.error(t('video.uploadError'));
      setVideoUrl(null);
      setSelectedFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;
    if (selectedFile) {
      await handleFileUpload(selectedFile);
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
    if (file?.type.startsWith('video/')) {
      await handleFileUpload(file);
    } else {
      toast.error(t('video.invalidFileType'));
    }
  };

  const handleRemoveVideo = () => {
    setVideoUrl(null);
    setSelectedFileName('');
    form.setValue(`questions.${index}.label`, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const isValidVideoUrl = (url: string | null): boolean => {
    if (!url) return false;
    return url.toLowerCase() !== 'video';
  };

  return (
    <FormItem className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>
          {t('video.title')} {index + 1}
        </FormLabel>
        {index > 0 && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleRemoveQuestion(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        {isValidVideoUrl(videoUrl) ? (
          <div className="space-y-2">
            <video controls src={videoUrl!} className="h-96 w-full" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{selectedFileName}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRemoveVideo}
              >
                {t('video.remove')}
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClickUpload}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex h-96 w-full items-center justify-center rounded-md bg-gradient-to-b from-[#A5C0EE] to-[#FBC5EC] transition-all duration-200 ${
              isDragging
                ? 'border-2 border-dashed border-blue-500 opacity-70'
                : ''
            }`}
          >
            {isUploading ? (
              <Spinner className="h-14 w-14 text-gray-200" />
            ) : (
              <div className="flex flex-col items-center">
                <CirclePlay className="mb-2 h-14 w-14 text-gray-200" />
                <p className="text-sm text-gray-200">
                  {isDragging ? t('video.dropHere') : t('video.dragOrClick')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name={`questions.${index}.label`}
        render={({ field: _field, fieldState }) => (
          <FormItem>
            <FormControl>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden w-full text-gray-500"
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </FormItem>
  );
};

export default FormVideoUpload;
