import { useState, useRef } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { uploadFileToBucket } from '~/utils/upload-video';
import { BriefCreationForm } from '../components/brief-creation-form';

export const useVideoUpload = (
  index: number,
  form: UseFormReturn<BriefCreationForm>,
  handleQuestionChange: (index: number, field: 'label', value: string) => void,
  t: (key: string) => string
) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(() => form.getValues(`questions.${index}.label`) as string | null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setSelectedFileName(file.name);
      setIsUploading(true);

      const bucketName = 'create_brief';
      const uploadedUrl = await uploadFileToBucket(file, bucketName, t);

      setVideoUrl(uploadedUrl);
      handleQuestionChange(index, 'label', uploadedUrl);
      form.setValue(`questions.${index}.label`, uploadedUrl);

      toast.success(t('video.uploadSuccess'));
    } catch (error) {
      console.error(t('video.uploadError'), error);
      setVideoUrl(null);
      setSelectedFileName('');
      toast.error(t('video.uploadError'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await handleFileUpload(selectedFile);
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

  return {
    videoUrl,
    isUploading,
    selectedFileName,
    isDragging,
    fileInputRef,
    handleFileUpload,
    handleFileChange,
    handleRemoveVideo,
    setIsDragging,
  };
};
