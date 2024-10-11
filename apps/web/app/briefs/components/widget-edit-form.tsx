'use client';

import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { CirclePlay } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import {
  createFile,
  createUploadBucketURL,
} from '~/team-accounts/src/server/actions/files/create/create-file';
import { generateUUID } from '~/utils/generate-uuid';

import { useBriefsContext } from '../contexts/briefs-context';
import { widgetEditSchema } from '../schemas/widget-edit-schema';

export function WidgetEditForm() {
  const { currentFormField, updateFormField } = useBriefsContext();
  const { t } = useTranslation('briefs');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoValid, setIsVideoValid] = useState<boolean>(false);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState<boolean>(false);

  const extractYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i,
      /^[^"&?/\s]{11}$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1] ?? null;
    }

    return null;
  };

  const form = useForm<z.infer<typeof widgetEditSchema>>({
    resolver: zodResolver(widgetEditSchema),
    defaultValues: currentFormField,
    mode: 'onChange',
  });

  const checkVideoValidity = async (url: string) => {
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`);
        if (response.ok) {
          setIsYouTubeVideo(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }

    setIsYouTubeVideo(false);
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error('Video not accessible');
      }

      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = url;

        video.onloadeddata = () => {
          resolve(true);
        };

        video.onerror = () => {
          resolve(false);
        };
      });
    } catch {
      return false;
    }
  };

  const {
    fields: optionsFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error(t('video.invalidFileType'));
      return;
    }

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

      const finalUrl = fileData?.[0]?.url ?? fileUrl;
      setVideoUrl(finalUrl);
      setIsVideoValid(true);

      if (currentFormField) {
        updateFormField(currentFormField.id, {
          ...form.getValues(),
          id: currentFormField.id,
          label: finalUrl,
        });
      }

      toast.success(t('video.uploadSuccess'));
    } catch (error) {
      console.error(t('video.uploadError'), error);
      toast.error(t('video.uploadError'));
      setVideoUrl(null);
      setIsVideoValid(false);
      setSelectedFileName('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (!url) return;

    try {
      setIsUploading(true);
      const isValid = await checkVideoValidity(url);
      
      if (isValid) {
        setVideoUrl(url);
        setIsVideoValid(true);
        setSelectedFileName(url);
        
        if (currentFormField) {
          updateFormField(currentFormField.id, {
            ...form.getValues(),
            id: currentFormField.id,
            label: url,
          });
        }
        toast.success(t('video.urlAddedSuccess'));
      } else {
        toast.error(t('video.invalidUrl'));
      }
    } catch (error) {
      console.error('Error validating video URL:', error);
      toast.error(t('video.invalidUrl'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    form.setValue(name as keyof z.infer<typeof widgetEditSchema>, value);

    if (currentFormField) {
      updateFormField(currentFormField.id, {
        ...form.getValues(),
        id: currentFormField.id,
        [name]: value,
      });
    }
  };

  const onSubmit = (values: z.infer<typeof widgetEditSchema>) => {
    if (currentFormField) {
      updateFormField(currentFormField.id, { ...currentFormField, ...values });
    }
  };

  const renderOptionFields = () => (
    <React.Fragment>
      {optionsFields.map((option, index) => (
        <div key={option.id} className="space-y-4">
          {renderFieldInput(`options.${index}.label`, 'Option Label')}
          {renderFieldInput(`options.${index}.value`, 'Option Value')}
          <Button
            variant="destructive"
            type="button"
            onClick={() => remove(index)}
          >
            Remove Option
          </Button>
        </div>
      ))}
      <Button type="button" onClick={() => append({ label: '', value: '' })}>
        Add Option
      </Button>
    </React.Fragment>
  );

  const renderFieldInput = (fieldName: string, label: string) => (
    <FormField
      key={fieldName}
      name={fieldName as keyof z.infer<typeof widgetEditSchema>}
      control={form.control}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm text-gray-700">{label}</FormLabel>
          <FormControl>
            <ThemedInput
              {...field}
              placeholder={label}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                field.onChange(e);
                handleChange(e);
              }}
              value={field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  const renderVideoContent = () => {
    if (isUploading) {
      return (
        <div className="flex h-40 w-full items-center justify-center">
          <Spinner className="h-14 w-14 text-gray-200" />
        </div>
      );
    }

    if (videoUrl && isVideoValid) {
      if (isYouTubeVideo) {
        const youtubeId = extractYouTubeId(videoUrl);
        return (
          <div className="space-y-2">
            <iframe
              className="h-40 w-full"
              src={`https://www.youtube.com/embed/${youtubeId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 truncate max-w-[70%]">{videoUrl}</span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setVideoUrl(null);
                  setIsVideoValid(false);
                  setIsYouTubeVideo(false);
                  setSelectedFileName('');
                  form.setValue('label', '');
                  if (currentFormField) {
                    updateFormField(currentFormField.id, {
                      ...form.getValues(),
                      id: currentFormField.id,
                      label: '',
                    });
                  }
                }}
              >
                {t('video.remove')}
              </Button>
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <video
            controls
            src={videoUrl}
            className="h-40 w-full"
            onError={() => {
              setIsVideoValid(false);
              console.error('Error loading video:', videoUrl);
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{selectedFileName}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setVideoUrl(null);
                setIsVideoValid(false);
                setSelectedFileName('');
                form.setValue('label', '');
                if (currentFormField) {
                  updateFormField(currentFormField.id, {
                    ...form.getValues(),
                    id: currentFormField.id,
                    label: '',
                  });
                }
              }}
            >
              {t('video.remove')}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`flex h-40 w-full items-center justify-center rounded-md bg-gradient-to-b from-[#A5C0EE] to-[#FBC5EC] transition-all duration-200 ${
            isDragging ? 'border-2 border-dashed border-blue-500 opacity-70' : ''
          }`}
        >
          <div className="flex flex-col items-center">
            <CirclePlay className="mb-2 h-14 w-14 text-gray-200" />
            <p className="text-sm text-gray-200">
              {isDragging ? t('video.dropHere') : t('video.dragOrClick')}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemedInput
            placeholder={t('video.youtubePlaceholder')}
            onChange={handleUrlInput}
            className="flex-1"
          />
        </div>
      </div>
    );
  };

  const renderFormFields = () => {
    if (!currentFormField) return null;

    const type = form.getValues('type');

    return Object.keys(currentFormField)
      .filter((key) => key !== 'id')
      .map((fieldName) => {
        if (fieldName === 'options') return renderOptionFields();
        if (type === 'video' && fieldName === 'label') {
          return <div key={fieldName}>{renderVideoContent()}</div>;
        }
        return renderFieldInput(
          fieldName,
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1),
        );
      });
  };

  useEffect(() => {
    form.reset(currentFormField);
    if (currentFormField?.type === 'video' && currentFormField?.label) {
      const validateInitialVideo = async () => {
        const isValid: boolean = (await checkVideoValidity(
          currentFormField.label,
        )) as boolean;
        setIsVideoValid(isValid);
        setVideoUrl(isValid ? currentFormField.label : null);
      };
      validateInitialVideo().catch((error) => {
        console.error('Error validating initial video:', error);
      });
    }
  }, [currentFormField, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full space-y-8"
      >
        <h2>
          {t('creation.form.questionLabel') + ' '}
          {currentFormField ? +currentFormField?.id + 1 : 0}
        </h2>
        {renderFormFields()}
      </form>
    </Form>
  );
}
