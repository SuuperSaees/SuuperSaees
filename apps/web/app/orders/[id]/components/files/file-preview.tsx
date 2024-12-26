import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { getFileTypeIcon } from '../../components/files/file-types';
import { FileIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

export const FilePreview: React.FC<FilePreviewProps> = ({
  src,
  fileName,
  fileType,
  alt,
  className,
  isDialog,
  actualPage = 1,
  onLoadPDF,
  zoomLevel = 1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
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
      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = page.getViewport({ scale: 1.5 * zoomLevel });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport
      };

      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    }
  };

  const renderPreview = () => {
    if (fileType.startsWith('image/')) {
      return isDialog ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-[60vh] object-contain ${className}`}
        />
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
      );
    }
    
    if (fileType.startsWith('video/')) {
      return (
        <div className={`w-full h-full ${className}`}>
          {isDialog ? (
            <video 
              src={src}
              controls
              className="w-full h-[60vh]"
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
            <div className="w-full h-full overflow-auto">
              <canvas
                ref={canvasRef}
                className="max-w-none mx-auto"
              />
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
        <FileIcon className="w-12 h-12 text-gray-400" />
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
