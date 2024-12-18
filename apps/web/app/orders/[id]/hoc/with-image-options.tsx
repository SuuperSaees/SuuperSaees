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
import Image from 'next/image';

interface ImageProps {
  src: string;
  alt?: string;
  className?: string;
  dialogClassName?: string; // New prop for dialog-specific class
  bucketName?: string;
  isDialog?: boolean;
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
      <div className="group relative inline-block h-full max-h-[2000px] w-[150px] min-w-[150px] overflow-hidden justify-center items-center flex">
        <ImageDialogView
          triggerComponent={
            <>
              <WrappedComponent {...props} />
              <div className="absolute right-0 top-0 flex items-center">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleToggleMenu();
                  }}
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
                      onClick={(event) => {
                        event.stopPropagation();
                        handleCopyLink().catch(console.error);
                      }}
                    >
                      {isLinkCopied ? (
                        <Check className="h-[15px] w-[15px] text-green-500" />
                      ) : (
                        <Copy className="h-[15px] w-[15px]" />
                      )}
                    </button>
                  </Tooltip>

                  <Tooltip content="View">
                    <button className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm">
                      <Eye className="h-[15px] w-[15px]" />
                    </button>
                  </Tooltip>

                  <Tooltip content="Download">
                    <button
                      className="flex h-[30px] w-[30px] items-center justify-center gap-2 rounded-full bg-white/70 text-sm"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDownload().catch(console.error);
                      }}
                    >
                      <Download className="h-[15px] w-[15px]" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </>
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
      </div>
    );
  };

  return WithImageOptions;
};

const ImageComponent: React.FC<ImageProps> = ({ src, alt, className, isDialog }) => {
  if (isDialog) {
    return (
      <img
        src={src}
        alt={alt}
        className={`aspect-square object-contain ${className}`}
      />
    )
  }
  return (
    <Image 
      src={src}
      alt={alt ?? 'image'}
      className={`aspect-square object-contain ${className}`}
      width={150}
      height={150}
      quality={100}
      priority
    />
  )
};

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
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
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
      <DialogContent className="p-8 h-[90vh] w-[90vw]">
        <div
          className="relative flex aspect-auto max-h-[calc(90vh-10rem)] w-full items-center justify-center overflow-hidden"
          ref={containerRef}
          onMouseMove={handleMouseMove}
        >
          <div
            className="relative max-h-full max-w-full transition-transform duration-200"
            onClick={handleImageClick}
            ref={imageRef}
            style={{
              transform: isZoomedIn
                ? `scale(2)`
                : 'scale(1)',
              transformOrigin: isZoomedIn ? `${mousePosition.x}% ${mousePosition.y}%` : 'center',
              cursor: isZoomedIn ? 'zoom-out' : 'zoom-in',
            }}
          >
            {React.cloneElement(imageContentComponent, {
              className: "max-h-[calc(90vh-12rem)] w-auto object-contain",
              isDialog: true,
            })}
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
