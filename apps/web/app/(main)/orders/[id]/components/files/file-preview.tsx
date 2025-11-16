import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { useTranslation } from 'react-i18next';

import { Spinner } from '@kit/ui/spinner';

import {
  FileIcon,
  getFileExtension,
} from '../../../../../components/shared/file-icons';

interface FilePreviewProps {
  src: string;
  fileName: string;
  fileType: string;
  alt?: string;
  className?: string;
  isDialog?: boolean;
  actualPage?: number;
  onLoadPDF?: (total: number) => void;
  zoomLevel?: number;
}

type ErrorState = {
  title: string;
  description: string;
  type: 'image' | 'video' | 'application/pdf';
} | null;

export const FilePreview: React.FC<FilePreviewProps> = ({
  src,
  fileName,
  fileType,
  alt,
  className,
  isDialog,
  actualPage = 1,
  onLoadPDF,
  zoomLevel = 1,
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState>(null);
  const { t } = useTranslation(['orders', 'files']);

  useEffect(() => {
    if (fileType.startsWith('application/pdf') && isDialog) {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          loadPDF();
        };
        document.head.appendChild(script);
      } else {
        loadPDF();
      }
    }
  }, [src, fileType, isDialog]);

  const loadPDF = async () => {
    try {
      const response = await fetch(src);
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await (window as any).pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;
      setPdfDoc(pdf);
      onLoadPDF?.(pdf.numPages);
      renderPage(actualPage, pdf);
    } catch (error) {
      console.error('Error loading PDF:', error);
      onLoadPDF?.(0);
      setError({
        title: t('preview.error.title'),
        description: t('preview.error.description'),
        type: 'application/pdf',
      });
    }
  };

  useEffect(() => {
    if (pdfDoc && actualPage) {
      renderPage(actualPage, pdfDoc);
    }
  }, [actualPage, pdfDoc, zoomLevel]);

  const renderPage = async (pageNum: number, pdf: any) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 * zoomLevel });

      // Create an off-screen canvas
      const canvas = document.createElement('canvas');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
      };

      await page.render(renderContext).promise;

      // Convert canvas to image data URL
      const imageUrl = canvas.toDataURL('image/png');
      setPageImage(imageUrl);
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  // Clean the error state on mount
  useEffect(() => {
    setError(null);
  }, [src]);

  const renderPreview = () => {
    if (error && isDialog) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <div className="animate-fade-in flex max-w-xs flex-col items-center space-y-3 p-6">
            <FileIcon
              extension={getFileExtension(fileName)}
              className="h-10 w-10 text-red-500"
              error
            />

            <span className="max-w-xs break-all rounded bg-red-50 px-2 py-0.5 text-center text-xs font-semibold text-red-500">
              {fileName}
            </span>
            <h2 className="text-center text-base font-semibold text-red-500">
              {error.title}
            </h2>
            <p className="text-center text-xs text-gray-500 ">
              {error.description}
            </p>
          </div>
        </div>
      );
    }

    if (
      fileType.startsWith('image/') ||
      (fileType.startsWith('application/pdf') && pageImage)
    ) {
      return isDialog ? (
        <img
          src={fileType.startsWith('application/pdf') ? pageImage! : src}
          alt={alt}
          className={`h-[calc(100vh-100px)] w-full object-contain ${className}`}
          onError={() => {
            console.error('Error loading image:', src);
            setError({
              title: t('preview.error.title'),
              description: t('preview.error.description'),
              type: 'image',
            });
          }}
        />
      ) : (
        <>
          {fileType.startsWith('application/pdf') ? (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon
                extension={getFileExtension(fileName)}
                size='md'
              />
            </div>
          ) : !error ? (
            <Image
              src={src}
              alt={alt ?? 'image'}
              className={`aspect-square object-contain ${className}`}
              width={150}
              height={150}
              quality={100}
              priority
              onError={() => {
                console.error('Error loading image:', src);
                setError({
                  title: t('preview.error.title'),
                  description: t('preview.error.description'),
                  type: 'image',
                });
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon
                extension={getFileExtension(fileName)}
                size='md'
                error
              />
            </div>
          )}
        </>
      );
    }

    if (fileType.startsWith('video/')) {
      return (
        <div className={`h-full w-full ${className}`}>
          {isDialog ? (
            <video src={src} controls className="h-[70vh] w-full" 
            onError={() => {
              console.error('Error loading video:', src);
              setError({
                title: t('preview.error.title'),
                description: t('preview.error.description'),
                type: 'video',
              });
            }}/>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon
                extension={getFileExtension(fileName)}
                size='md'
              />
            </div>
          )}
        </div>
      );
    }

    if (fileType.startsWith('application/pdf')) {
      return (
        <div className={`h-[60vh] w-full ${className}`}>
          {isDialog ? (
            <div className="flex h-full w-full items-center justify-center">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileIcon
                extension={getFileExtension(fileName)}
                size='md'
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={`flex h-[60vh] w-full flex-col items-center justify-center ${className}`}
      >
        {!isDialog && (
          <FileIcon
            extension={getFileExtension(fileName)}
            size='md'
          />
        )}
        
        {isDialog ? (
          <>
            <div className="animate-fade-in flex max-w-xs flex-col items-center space-y-3 p-6">
              <FileIcon
                extension={getFileExtension(fileName)}
                className="h-10 w-10 text-gray-400"
              />

              <span className="max-w-xs break-all rounded bg-gray-50 px-2 py-0.5 text-center text-xs font-semibold text-gray-500">
                {fileName}
              </span>
              <h2 className="text-center text-base font-semibold text-gray-500">
                {t('files.noPreview')}
              </h2>
              <p className="text-center text-xs text-gray-500">
                {t('files.download')}
              </p>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    );
  };

  return renderPreview();
};
