'use client';

import React, { ComponentType, useEffect, useRef, useState } from 'react';

// import { useMutation } from '@tanstack/react-query';
import {
  Check,
  Copy,
  Download,
  Eye,
  MoreVertical, // TrashIcon,
} from 'lucide-react';

// import { toast } from 'sonner';
// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@kit/ui/dialog';

import Tooltip from '~/components/ui/tooltip';

import { useImageActions } from '../hooks/use-image-actions';

// Define the props for the wrapped component
interface ImageProps {
  src: string;
  alt?: string;
  bucketName?: string;
}

// Define the HOC to add options for image interactions
export const withImageOptions = <P extends ImageProps>(
  WrappedComponent: ComponentType<P>,
) => {
  const WithImageOptions: React.FC<P> = (props) => {
    const {
      isLinkCopied,
      isMenuOpen,
      handleCopyLink,
      handleDownload,
      handleToggleMenu,
    } = useImageActions({
      src: props.src,
      bucketName: props.bucketName,
    });

    return (
      <div className="group relative inline-block h-full max-h-[2000px] w-auto overflow-hidden">
        <WrappedComponent {...props} />
        {/* Button and Options Container */}
        <div className="absolute right-0 top-0 flex items-center">
          {/* Three-dot menu button (only visible on small screens) */}
          <button
            onClick={handleToggleMenu}
            className="p-2 text-black sm:hidden" // Show this only on small screens
          >
            <MoreVertical className="h-6 w-6" />
          </button>

          {/* Options Container */}
          <div
            className={`${
              isMenuOpen ? 'flex' : 'hidden'
            } absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 sm:right-0 sm:top-0 sm:flex-row sm:items-center sm:group-hover:flex`}
          >
            <Tooltip content={'Copy link'}>
              <button
                className="flex h-[35px] w-[35px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                onClick={handleCopyLink}
              >
                {isLinkCopied ? (
                  <Check className="h-[20px] w-[20px] text-green-500" />
                ) : (
                  <Copy className="h-[20px] w-[20px]" />
                )}
              </button>
            </Tooltip>

            <ImageDialogView
              triggerComponent={
                <Tooltip content="View">
                  <button className="flex h-[35px] w-[35px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm">
                    <Eye className="h-[20px] w-[20px]" />
                  </button>
                </Tooltip>
              }
              imageContentComponent={<WrappedComponent {...props} />}
              handleCopyLink={handleCopyLink}
              handleDownload={handleDownload}
              isLinkCopied={isLinkCopied}
            />

            <Tooltip content="Download">
              <button
                className="flex h-[35px] w-[35px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                onClick={handleDownload}
              >
                <Download className="h-[20px] w-[20px]" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  return WithImageOptions;
};

// Basic Image component
const ImageComponent: React.FC<ImageProps> = ({ src, alt }) => (
  /*eslint-disable @next/next/no-img-element */
  <img
    src={src}
    alt={alt}
    className="object-contain aspect-square h-full max-h-[70vh] w-full"
  />
);


// Create the HOC-enhanced component
const ImageWithOptions = withImageOptions(ImageComponent);

interface ImageDialogViewProps {
  triggerComponent: JSX.Element;
  imageContentComponent: JSX.Element;
  handleCopyLink: () => void;
  handleDownload: () => void;
  isLinkCopied: boolean;
}

export const ImageDialogView: React.FC<ImageDialogViewProps> = ({
  triggerComponent,
  imageContentComponent,
  handleCopyLink,
  handleDownload,
  isLinkCopied,
}) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current && imageRef.current) {
      const { left, top, width, height } =
        containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - left) / width) * 100;
      const y = ((event.clientY - top) / height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleImageClick = () => {
    setIsZoomedIn((prev) => !prev);
  };

  // Reset zoom when the dialog is closed
  useEffect(() => {
    const handleDialogClose = () => {
      setIsZoomedIn(false);
    };

    document.addEventListener('dialogClose', handleDialogClose);

    return () => {
      document.removeEventListener('dialogClose', handleDialogClose);
    };
  }, []);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setIsZoomedIn(false); // Reset zoom when the dialog is closed
        }
      }}
    >
      <DialogTrigger>{triggerComponent}</DialogTrigger>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-4">
        <div
          className="relative flex h-full w-full items-center justify-center overflow-hidden"
          ref={containerRef}
          onMouseMove={handleMouseMove}
        >
          <div
            className="relative"
            onClick={handleImageClick}
            ref={imageRef}
            style={{
              transform: isZoomedIn
                ? `scale(2) translate(-${mousePosition.x}%, -${mousePosition.y}%)`
                : 'scale(1)',
              transformOrigin: '0 0', // Ensures zoom is relative to the top-left corner
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
            }}
          >
            {imageContentComponent}
          </div>
        </div>
        <DialogFooter className="flex w-full flex-row sm:justify-start sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex items-center"
              onClick={handleDownload}
            >
              <Download className="mr-2 h-5 w-5" />
              <span>Download</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleCopyLink}
            >
              {isLinkCopied ? (
                <Check className="h-[20px] w-[20px] text-green-500" />
              ) : (
                <Copy className="h-[20px] w-[20px]" />
              )}
              <span>{isLinkCopied ? 'Link copied!' : 'Copy link'}</span>
            </Button>
            {/* <Button
              type="button"
              variant="outline"
              className="flex items-center"
            >
              <TrashIcon className="mr-2 h-5 w-5" />
              <span>Delete</span>
            </Button> */}
          </div>
          <DialogClose asChild className="ml-auto">
            <Button type="button" variant="secondary" className="ml-auto">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ImageWithOptions;
