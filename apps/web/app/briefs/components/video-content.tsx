import React from 'react';

import { CirclePlay } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Spinner } from '@kit/ui/spinner';

import { isValidVideoUrl, isYouTubeUrl } from '~/utils/upload-video';

import { BriefsProvider } from '../contexts/briefs-context';
import { useVideoUpload } from '../hooks/use-video-upload';
import { ComponentProps } from '../types/brief.types';

const FormVideoUpload: React.FC<ComponentProps> = ({
  question,
  index,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const {
    videoUrl,
    isUploading,
    selectedFileName,
    isDragging,
    fileInputRef,
    handleFileChange,
    handleRemoveVideo,
    setIsDragging,
  } = useVideoUpload(index, form, handleQuestionChange, t);

  return (
    <FormItem className="space-y-4">
      <FormLabel>
        {t('video.title')} {index + 1}
      </FormLabel>
      <div>
        {isValidVideoUrl(videoUrl) ? (
          <div className="space-y-2">
            {isYouTubeUrl(videoUrl!) ? (
              <iframe
                width="100%"
                height="400"
                src={`https://www.youtube.com/embed/${new URL(videoUrl!).searchParams.get('v')}`}
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <video controls src={videoUrl!} className="h-96 w-full" />
            )}
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
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
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
                  {t('video.dragOrClick')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <FormField
        control={form.control}
        name={`questions.${index}.label`}
        render={({ fieldState }) => (
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
      <BriefsProvider.Options
        formFieldId={question.id}
        className="flex justify-end"
      />
    </FormItem>
  );
};

export default FormVideoUpload;
