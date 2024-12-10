'use client';

import React, { ComponentType, useEffect, useRef, useState, type JSX } from 'react';

import { Check, Copy, Download, Eye, MoreVertical } from 'lucide-react';

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

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  dialogClassName?: string; // New prop for dialog-specific class
  bucketName?: string;
}

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
      <div className="group relative inline-block h-full max-h-[2000px] w-[150px] min-w-[150px] overflow-hidden">
        <WrappedComponent {...props} />
        <div className="absolute right-0 top-0 flex items-center">
          <button
            onClick={handleToggleMenu}
            className="p-2 text-black sm:hidden"
          >
            <MoreVertical className="h-6 w-6" />
          </button>

          <div
            className={`${
              isMenuOpen ? 'flex' : 'hidden'
            } absolute right-0 top-8 z-10 flex-col items-start gap-2 rounded-md bg-transparent p-2 text-gray-700 sm:right-0 sm:top-0 sm:flex-row sm:items-center sm:group-hover:flex`}
          >
            <Tooltip content={'Copy link'}>
              <button
                className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                onClick={handleCopyLink}
              >
                {isLinkCopied ? (
                  <Check className="h-[15px] w-[15px] text-green-500" />
                ) : (
                  <Copy className="h-[15px] w-[15px]" />
                )}
              </button>
            </Tooltip>

            <ImageDialogView
              triggerComponent={
                <Tooltip content="View">
                  <button className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm">
                    <Eye className="h-[15px] w-[15px]" />
                  </button>
                </Tooltip>
              }
              imageContentComponent={
                <WrappedComponent
                  {...props}
                  className={props.dialogClassName}
                />
              }
              handleCopyLink={handleCopyLink}
              handleDownload={handleDownload}
              isLinkCopied={isLinkCopied}
            />

            <Tooltip content="Download">
              <button
                className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                onClick={handleDownload}
              >
                <Download className="h-[15px] w-[15px]" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

  return WithImageOptions;
};

const ImageComponent: React.FC<ImageProps> = ({ src, alt, className }) => (
  <img
    src={src}
    alt={alt}
    className={`aspect-square object-contain ${className}`}
  />
);

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
          setIsZoomedIn(false);
        }
      }}
    >
      <DialogTrigger>{triggerComponent}</DialogTrigger>
      <DialogContent className="h-[80vh] max-h-[90vh] max-w-[90vw] p-8">
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
              transformOrigin: '0 0',
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
            }}
          >
            {imageContentComponent}
          </div>
        </div>
        <DialogFooter className="mt-auto flex w-full flex-row sm:justify-start sm:justify-between">
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
