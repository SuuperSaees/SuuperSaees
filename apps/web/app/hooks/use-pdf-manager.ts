"use client";

import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

// Define PDF.js types (simpler than importing the full library)
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): PDFViewport;
  render(params: { canvasContext: CanvasRenderingContext2D; viewport: PDFViewport }): { promise: Promise<void> };
}

interface PDFViewport {
  width: number;
  height: number;
}

// Global PDF.js reference
declare global {
  interface Window {
    pdfjsLib?: {
      getDocument: (params: { data: ArrayBuffer | Uint8Array | string }) => { promise: Promise<PDFDocumentProxy> };
      GlobalWorkerOptions: {
        workerSrc: string;
      };
    };
  }
}

interface PDFViewerState {
  document: PDFDocumentProxy | null;
  totalPages: number;
  currentPage: number;
  scale: number;
  isLoading: boolean;
  error: string | null;
}

interface PDFGenerationOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
}

interface PDFChunk {
  pageNumber: number;
  imageData: string;
  isLoaded: boolean;
}

export interface PDFManagerReturn {
  // Viewer state
  viewerState: PDFViewerState;
  
  // Generation methods
  generatePDF: (htmlContent: string, options?: PDFGenerationOptions) => Promise<Blob>;
  downloadPDF: (blob: Blob, filename: string) => void;
  
  // Viewer methods  
  loadPDF: (source: string | Uint8Array | ArrayBuffer) => Promise<void>;
  renderPage: (pageNumber: number) => Promise<string>;
  goToPage: (pageNumber: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // Chunked loading for large files
  loadPagesInChunks: (chunkSize?: number) => Promise<PDFChunk[]>;
  preloadNextPages: (currentPage: number, lookahead?: number) => Promise<void>;
  
  // Cleanup
  cleanup: () => void;
}

export const usePDFManager = (): PDFManagerReturn => {
  const { t } = useTranslation(['invoices', 'files']);
  const [viewerState, setViewerState] = useState<PDFViewerState>({
    document: null,
    totalPages: 0,
    currentPage: 1,
    scale: 1.0,
    isLoading: false,
    error: null,
  });
  
  const pageCache = useRef<Map<number, string>>(new Map());
  const renderQueue = useRef<Set<number>>(new Set());

  const generatePDF = useCallback(async (
    htmlContent: string, 
    options: PDFGenerationOptions = {}
  ): Promise<Blob> => {
    try {
      const { jsPDF } = await import('jspdf');
      
      const pdf = new jsPDF({
        orientation: options.orientation ?? 'portrait',
        unit: 'mm',
        format: options.format ?? 'a4',
      });

      // Create a temporary container for HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = '210mm'; // A4 width
      document.body.appendChild(tempDiv);

      try {
        // Convert HTML to PDF using jsPDF's html method
        await pdf.html(tempDiv, {
          callback: () => {
            document.body.removeChild(tempDiv);
          },
          x: 10,
          y: 10,
          width: 190, // A4 width minus margins
          windowWidth: 794, // A4 width in pixels at 96 DPI
        });

        return pdf.output('blob');
      } finally {
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
      }
    } catch (error) {
      toast.error(t('files:errors.pdfGeneration'));
      throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [t]);

  const downloadPDF = useCallback((blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Load PDF.js library dynamically via CDN
  const loadPDFJS = useCallback(async (): Promise<void> => {
    if (window.pdfjsLib) return;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve();
        } else {
          reject(new Error('Failed to load PDF.js'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load PDF.js script'));
      document.head.appendChild(script);
    });
  }, []);

  const loadPDF = useCallback(async (source: string | Uint8Array | ArrayBuffer): Promise<void> => {
    setViewerState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Load PDF.js if not already loaded
      await loadPDFJS();
      
      if (!window.pdfjsLib) {
        throw new Error('PDF.js library not available');
      }

      let pdfData: ArrayBuffer | Uint8Array;
      
      if (typeof source === 'string') {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.statusText}`);
        }
        pdfData = await response.arrayBuffer();
      } else {
        pdfData = source;
      }

      const pdf = await window.pdfjsLib.getDocument({ data: pdfData }).promise;
      
      setViewerState(prev => ({
        ...prev,
        document: pdf,
        totalPages: pdf.numPages,
        currentPage: 1,
        isLoading: false,
        error: null,
      }));
      
      // Clear cache when loading new PDF
      pageCache.current.clear();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setViewerState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      toast.error(t('files:errors.pdfLoad'));
    }
  }, [t, loadPDFJS]);

  const renderPage = useCallback(async (pageNumber: number): Promise<string> => {
    if (!viewerState.document) {
      throw new Error('No PDF document loaded');
    }

    // Check cache first
    const cached = pageCache.current.get(pageNumber);
    if (cached) {
      return cached;
    }

    // Prevent duplicate renders
    if (renderQueue.current.has(pageNumber)) {
      return new Promise((resolve) => {
        const checkCache = () => {
          const result = pageCache.current.get(pageNumber);
          if (result) {
            resolve(result);
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    renderQueue.current.add(pageNumber);

    try {
      const page: PDFPageProxy = await viewerState.document.getPage(pageNumber);
      const viewport = page.getViewport({ scale: viewerState.scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
      const imageData = canvas.toDataURL('image/png');
      
      // Cache the result
      pageCache.current.set(pageNumber, imageData);
      
      return imageData;
    } finally {
      renderQueue.current.delete(pageNumber);
    }
  }, [viewerState.document, viewerState.scale]);

  const loadPagesInChunks = useCallback(async (chunkSize = 5): Promise<PDFChunk[]> => {
    if (!viewerState.document) {
      return [];
    }

    const chunks: PDFChunk[] = [];
    
    // Initialize chunks
    for (let i = 1; i <= viewerState.totalPages; i++) {
      chunks.push({
        pageNumber: i,
        imageData: '',
        isLoaded: false,
      });
    }

    // Load first chunk immediately
    const firstChunkPromises = chunks
      .slice(0, chunkSize)
      .map(async (chunk) => {
        try {
          const imageData = await renderPage(chunk.pageNumber);
          chunk.imageData = imageData;
          chunk.isLoaded = true;
        } catch (error) {
          console.error(`Failed to load page ${chunk.pageNumber}:`, error);
        }
      });

    await Promise.all(firstChunkPromises);

    // Load remaining chunks in background
    const loadRemainingChunks = async () => {
      for (let i = chunkSize; i < chunks.length; i += chunkSize) {
        const chunkPromises = chunks
          .slice(i, i + chunkSize)
          .map(async (chunk) => {
            try {
              const imageData = await renderPage(chunk.pageNumber);
              chunk.imageData = imageData;
              chunk.isLoaded = true;
            } catch (error) {
              console.error(`Failed to load page ${chunk.pageNumber}:`, error);
            }
          });
        
        await Promise.all(chunkPromises);
        
        // Small delay to prevent blocking the UI
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    };

    // Start background loading
    loadRemainingChunks().catch(console.error);

    return chunks;
  }, [viewerState.document, viewerState.totalPages, renderPage]);

  const preloadNextPages = useCallback(async (currentPage: number, lookahead = 3): Promise<void> => {
    if (!viewerState.document) return;

    const pagesToPreload = [];
    for (let i = 1; i <= lookahead; i++) {
      const nextPage = currentPage + i;
      if (nextPage <= viewerState.totalPages && !pageCache.current.has(nextPage)) {
        pagesToPreload.push(nextPage);
      }
    }

    const preloadPromises = pagesToPreload.map(pageNum => 
      renderPage(pageNum).catch(error => 
        console.error(`Failed to preload page ${pageNum}:`, error)
      )
    );

    await Promise.allSettled(preloadPromises);
  }, [viewerState.document, viewerState.totalPages, renderPage]);

  const goToPage = useCallback((pageNumber: number): void => {
    if (pageNumber >= 1 && pageNumber <= viewerState.totalPages) {
      setViewerState(prev => ({ ...prev, currentPage: pageNumber }));
      
      // Preload nearby pages
      preloadNextPages(pageNumber).catch(console.error);
    }
  }, [viewerState.totalPages, preloadNextPages]);

  const zoomIn = useCallback((): void => {
    setViewerState(prev => {
      const newScale = Math.min(prev.scale * 1.25, 3.0);
      pageCache.current.clear(); // Clear cache when scale changes
      return { ...prev, scale: newScale };
    });
  }, []);

  const zoomOut = useCallback((): void => {
    setViewerState(prev => {
      const newScale = Math.max(prev.scale * 0.8, 0.5);
      pageCache.current.clear(); // Clear cache when scale changes
      return { ...prev, scale: newScale };
    });
  }, []);

  const resetZoom = useCallback((): void => {
    setViewerState(prev => {
      pageCache.current.clear(); // Clear cache when scale changes
      return { ...prev, scale: 1.0 };
    });
  }, []);

  const cleanup = useCallback((): void => {
    pageCache.current.clear();
    renderQueue.current.clear();
    setViewerState({
      document: null,
      totalPages: 0,
      currentPage: 1,
      scale: 1.0,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    viewerState,
    generatePDF,
    downloadPDF,
    loadPDF,
    renderPage,
    goToPage,
    zoomIn,
    zoomOut,
    resetZoom,
    loadPagesInChunks,
    preloadNextPages,
    cleanup,
  };
}; 