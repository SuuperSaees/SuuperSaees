"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { Spinner } from '@kit/ui/spinner';
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight,
  X 
} from 'lucide-react';
import { usePDFManager } from '../../hooks/use-pdf-manager';

interface PDFPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl?: string;
  pdfBlob?: Blob;
  fileName?: string;
  onDownload?: () => void;
  title?: string;
}

interface PDFPageProps {
  pageNumber: number;
  imageData: string;
  isLoaded: boolean;
  scale: number;
}

const PDFPage: React.FC<PDFPageProps> = ({ imageData, isLoaded, scale }) => {
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded border">
        <Spinner className="h-8 w-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <img 
        src={imageData} 
        alt="PDF Page"
        className="border border-gray-300 shadow-lg rounded"
        style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
      />
    </div>
  );
};

export const PDFPreviewDialog: React.FC<PDFPreviewDialogProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  pdfBlob,
  fileName = 'document.pdf',
  onDownload,
  title = 'PDF Preview',
}) => {
  const {
    viewerState,
    loadPDF,
    renderPage,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
    loadPagesInChunks,
    cleanup,
  } = usePDFManager();

  const [currentPageData, setCurrentPageData] = useState<string>('');
  const [pageChunks, setPageChunks] = useState<Array<{
    pageNumber: number;
    imageData: string;
    isLoaded: boolean;
  }>>([]);

  // Load PDF when dialog opens
  useEffect(() => {
    if (isOpen && (pdfUrl ?? pdfBlob)) {
      const loadSource = async () => {
        try {
          if (pdfBlob) {
            const arrayBuffer = await pdfBlob.arrayBuffer();
            await loadPDF(arrayBuffer);
          } else if (pdfUrl) {
            await loadPDF(pdfUrl);
          }
        } catch (error) {
          console.error('Failed to load PDF:', error);
        }
      };

      void loadSource();
    }

    return () => {
      if (!isOpen) {
        cleanup();
        setCurrentPageData('');
        setPageChunks([]);
      }
    };
  }, [isOpen, pdfUrl, pdfBlob, loadPDF, cleanup]);

  // Load pages in chunks for better performance
  useEffect(() => {
    if (viewerState.document && viewerState.totalPages > 0) {
      const loadChunks = async () => {
        try {
          const chunks = await loadPagesInChunks(3); // Load 3 pages at a time
          setPageChunks(chunks);
        } catch (error) {
          console.error('Failed to load page chunks:', error);
        }
      };

      void loadChunks();
    }
  }, [viewerState.document, viewerState.totalPages, loadPagesInChunks]);

  // Render current page
  useEffect(() => {
    if (viewerState.document && viewerState.currentPage) {
      const renderCurrentPage = async () => {
        try {
          const imageData = await renderPage(viewerState.currentPage);
          setCurrentPageData(imageData);
        } catch (error) {
          console.error('Failed to render page:', error);
          setCurrentPageData('');
        }
      };

      void renderCurrentPage();
    }
  }, [viewerState.document, viewerState.currentPage, viewerState.scale, renderPage]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload();
    } else if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [onDownload, pdfBlob, pdfUrl, fileName]);

  const handlePreviousPage = useCallback(() => {
    if (viewerState.currentPage > 1) {
      goToPage(viewerState.currentPage - 1);
    }
  }, [viewerState.currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    if (viewerState.currentPage < viewerState.totalPages) {
      goToPage(viewerState.currentPage + 1);
    }
  }, [viewerState.currentPage, viewerState.totalPages, goToPage]);

  const formatScale = (scale: number): string => {
    return `${Math.round(scale * 100)}%`;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Navigation */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={viewerState.currentPage <= 1 || viewerState.isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-gray-600 min-w-[80px] text-center">
              {viewerState.totalPages > 0 
                ? `${viewerState.currentPage} / ${viewerState.totalPages}`
                : '--'
              }
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={viewerState.currentPage >= viewerState.totalPages || viewerState.isLoading}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={viewerState.scale <= 0.5 || viewerState.isLoading}
              className="h-8 w-8 p-0"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            
            <span className="text-sm text-gray-600 min-w-[50px] text-center">
              {formatScale(viewerState.scale)}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={viewerState.scale >= 3.0 || viewerState.isLoading}
              className="h-8 w-8 p-0"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              disabled={viewerState.isLoading}
              className="h-8 w-8 p-0"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>

          {/* Download Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto min-h-0">
          {viewerState.isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Spinner className="h-8 w-8 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          ) : viewerState.error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-red-600">
                <p className="font-medium">Failed to load PDF</p>
                <p className="text-sm text-gray-500 mt-1">{viewerState.error}</p>
              </div>
            </div>
          ) : viewerState.document ? (
            <div className="p-6">
              <div className="max-w-full overflow-auto">
                {currentPageData ? (
                  <PDFPage
                    pageNumber={viewerState.currentPage}
                    imageData={currentPageData}
                    isLoaded={true}
                    scale={viewerState.scale}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 bg-gray-100 rounded border">
                    <Spinner className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Page thumbnails for large PDFs */}
              {viewerState.totalPages > 1 && (
                <div className="mt-8 border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">
                    Pages ({viewerState.totalPages})
                  </h4>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {pageChunks.map((chunk) => (
                      <button
                        key={chunk.pageNumber}
                        onClick={() => goToPage(chunk.pageNumber)}
                        className={`relative border-2 rounded-lg overflow-hidden hover:border-blue-400 transition-colors ${
                          chunk.pageNumber === viewerState.currentPage
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200'
                        }`}
                      >
                        {chunk.isLoaded && chunk.imageData ? (
                          <img
                            src={chunk.imageData}
                            alt={`Page ${chunk.pageNumber}`}
                            className="w-full h-auto"
                          />
                        ) : (
                          <div className="w-full h-20 bg-gray-100 flex items-center justify-center">
                            <Spinner className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs py-1 text-center">
                          {chunk.pageNumber}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-96">
              <p className="text-gray-500">No PDF loaded</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 