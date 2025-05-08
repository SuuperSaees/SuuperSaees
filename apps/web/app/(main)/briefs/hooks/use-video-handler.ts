import { useState, useRef, ChangeEvent, DragEvent, useCallback } from 'react';
import { toast } from 'sonner';
import { generateUUID } from '~/utils/generate-uuid';
import { createUploadBucketURL, createFiles } from '~/team-accounts/src/server/actions/files/create/create-file';
import { extractYouTubeId } from '~/utils/upload-video';
import { UseFormReturn } from 'react-hook-form';
import { widgetEditSchema } from '../schemas/widget-edit-schema';
import { z } from 'zod';
import { FormField } from '../types/brief.types';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';


type TranslationFunction = (key: string) => string;

export function useVideoHandler(t: TranslationFunction, form: UseFormReturn<z.infer<typeof widgetEditSchema>>, currentFormField: FormField | undefined, updateFormField: (
  id: string,
  updatedFormField: FormField,
) => void) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoValid, setIsVideoValid] = useState<boolean>(false);
  const [isYouTubeVideo, setIsYouTubeVideo] = useState<boolean>(false);
  const {workspace: userWorkspace} = useUserWorkspace();
  const checkVideoValidity = useCallback(async (url: string) => {
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
      if (!response.ok) throw new Error('Video not accessible');

      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = url;
        video.onloadeddata = () => resolve(true);
        video.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file?.type?.startsWith('video/')) {
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
      if (!urlData || 'error' in urlData || !urlData.signedUrl) throw new Error(t('video.uploadUrlError'));

      const uploadResponse = await fetch(urlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      if (!uploadResponse.ok) throw new Error(t('video.uploadError'));

      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/create_brief/${filePath}`;
      const fileData = await createFiles([{ name: sanitizedFileName, size: file.size, type: file.type, url: fileUrl, user_id: userWorkspace.id ?? ''}]);
      const finalUrl = fileData?.[0]?.url ?? fileUrl;

      setVideoUrl(finalUrl);
      setIsVideoValid(true);

      if (currentFormField) {
        updateFormField(currentFormField.id, { ...form.getValues(), position: currentFormField.position, label: finalUrl });
      }

      toast.success(t('video.uploadSuccess'));
    } catch (error) {
      console.error(t('video.uploadError'), error);
      toast.error(t('video.uploadError'));
      resetVideoState();
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = async (e: ChangeEvent<HTMLInputElement>) => {
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
          updateFormField(currentFormField.id, { ...form.getValues(), position: currentFormField.position, label: url });
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

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFileUpload(file);
  };

  const resetVideoState = () => {
    setVideoUrl(null);
    setIsVideoValid(false);
    setSelectedFileName('');
    if (currentFormField) {
      updateFormField(currentFormField.id, { ...form.getValues(), position: currentFormField.position, label: '' });
    }
  };

  return {
    isUploading,
    videoUrl,
    isVideoValid,
    isDragging,
    fileInputRef,
    isYouTubeVideo,
    selectedFileName,
    setVideoUrl,
    setIsVideoValid,
    setIsYouTubeVideo,
    setSelectedFileName,
    handleFileChange,
    handleUrlInput,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetVideoState,
    checkVideoValidity  
  };
}
