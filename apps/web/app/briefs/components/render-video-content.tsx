import React from 'react';
import { CirclePlay } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { extractYouTubeId } from '~/utils/upload-video';

interface RenderVideoContentProps {
  isUploading: boolean;
  videoUrl: string | null;
  isVideoValid: boolean;
  isDragging: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isYouTubeVideo: boolean;
  selectedFileName: string;
  t: (key: string) => string;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUrlInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setVideoUrl: (url: string | null) => void;
  setIsVideoValid: (isValid: boolean) => void;
  setIsYouTubeVideo: (isYouTube: boolean) => void;
  setSelectedFileName: (name: string) => void;
}

export const RenderVideoContent: React.FC<RenderVideoContentProps> = ({
  isUploading,
  videoUrl,
  isVideoValid,
  isDragging,
  fileInputRef,
  isYouTubeVideo,
  selectedFileName,
  t,
  handleFileChange,
  handleUrlInput,
  handleDragEnter,
  handleDragLeave,
  handleDrop,
  setVideoUrl,
  setIsVideoValid,
  setIsYouTubeVideo,
  setSelectedFileName,
}) => {
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
            <span className="text-sm text-gray-500 truncate max-w-[70%]">
              {videoUrl}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                setVideoUrl(null);
                setIsVideoValid(false);
                setIsYouTubeVideo(false);
                setSelectedFileName('');
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
