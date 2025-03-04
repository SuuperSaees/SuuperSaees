import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getFileTypeIcon } from '../../components/files/file-types';
import { useTranslation } from 'react-i18next';
import { Spinner } from '@kit/ui/spinner';
import { File } from '~/lib/file.types';
import { canPreviewFile, getFileType } from '../../../../lib/file-types';
import { getFileExtension, FileIcon } from '../../../../components/shared/file-icons';

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
  files?: File.Response[];
}

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
  files
}) => {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const { t } = useTranslation('orders');

  useEffect(() => {
    if (fileType.startsWith('application/pdf') && isDialog) {
      if (!(window as any).pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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
      const pdf = await (window as any).pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(pdf);
      onLoadPDF?.(pdf.numPages);
      renderPage(actualPage, pdf);
    } catch (error) {
      console.error('Error loading PDF:', error);
      onLoadPDF?.(0);
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
        viewport: viewport
      };

      await page.render(renderContext).promise;

      // Convert canvas to image data URL
      const imageUrl = canvas.toDataURL('image/png');
      setPageImage(imageUrl);
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const renderPreview = () => {
    if ((fileType.startsWith('image/') && canPreviewFile(getFileType(fileType, getFileExtension(fileName)))) || (fileType.startsWith('application/pdf') && pageImage)) {
      return isDialog ? (
        <img
          src={fileType.startsWith('application/pdf') ? pageImage! : src}
          alt={alt}
          className={`w-full h-[calc(100vh-100px)] object-contain ${className}`}
        />
      ) : (
        <>
         {
          fileType.startsWith('application/pdf') ? (
            <div className="w-full h-full flex items-center justify-center">
              <FileIcon extension={getFileExtension(fileName)} size="lg" />
            </div>
          ) : (
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
         }
        </>
      );
    }
    
    if (fileType.startsWith('video/')) {
      return (
        <div className={`w-full h-full ${className}`}>
          {isDialog ? (
            <video 
              src={src}
              controls
              className="w-full h-[70vh]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileTypeIcon(fileName)}
            </div>
          )}
        </div>
      );
    }

    if (fileType.startsWith('application/pdf')) {              
      return (
        <div className={`w-full h-[60vh] ${className}`}>
          {isDialog ? (
            <div className="w-full h-full flex items-center justify-center">
              <Spinner className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {getFileTypeIcon(fileName)}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={`w-full h-[60vh] flex flex-col items-center justify-center ${className}`}>
        <FileIcon extension={getFileExtension(fileName)} size="lg" />
        {isDialog ? (
          <>
            <p className="text-gray-400">{fileName}</p>
            <div className="flex flex-col items-center justify-center my-4">
              <p className="text-gray-400">{t('files.noPreview')}</p>
              <p className="text-gray-400">{t('files.download')}</p>
            </div>
          </>
        ) : (
          <div>
          </div>

        )}
      </div>
    );
  };

  return renderPreview();
};
