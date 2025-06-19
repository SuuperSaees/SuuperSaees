import { useState, useEffect, useCallback } from 'react';
import { FileUploadState } from './use-file-upload';

interface FileValidationResult {
  hasError: boolean;
  isValidating: boolean;
}

interface FileValidationOptions {
  enabled?: boolean;
  timeout?: number;
  cacheResults?: boolean;
  upload?: FileUploadState;
  validationDelay?: number;
}

// Simple in-memory cache for validation results
const validationCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useFileValidation = (
  src: string,
  fileType: string,
  renderAs: string,
  options: FileValidationOptions = {}
): FileValidationResult => {
  const { 
    enabled = false, 
    timeout = 10000, 
    cacheResults = true,
    upload,
    validationDelay = 2000
  } = options;

  const [hasError, setHasError] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const getCachedResult = useCallback((url: string): boolean | null => {
    if (!cacheResults) return null;
    
    const cached = validationCache.get(url);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (isExpired) {
      validationCache.delete(url);
      return null;
    }
    
    return cached.result;
  }, [cacheResults]);

  const setCachedResult = useCallback((url: string, result: boolean) => {
    if (!cacheResults) return;
    validationCache.set(url, { result, timestamp: Date.now() });
  }, [cacheResults]);

  const validateFile = useCallback(async (url: string, type: string): Promise<boolean> => {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        // Try to fetch the file headers to check if it's accessible
        const response = await fetch(url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          return false;
        }

        // For images, try to load them to detect corruption
        if (type.startsWith('image/')) {
          return new Promise((resolve) => {
            const img = new Image();
            const imgTimeout = setTimeout(() => {
              img.onload = null;
              img.onerror = null;
              resolve(false);
            }, timeout);

            img.onload = () => {
              clearTimeout(imgTimeout);
              resolve(true);
            };
            img.onerror = () => {
              clearTimeout(imgTimeout);
              resolve(false);
            };
            img.src = url;
          });
        }

        // For videos, create a video element to test
        if (type.startsWith('video/')) {
          return new Promise((resolve) => {
            const video = document.createElement('video');
            const videoTimeout = setTimeout(() => {
              video.onloadedmetadata = null;
              video.onerror = null;
              resolve(false);
            }, timeout);

            video.onloadedmetadata = () => {
              clearTimeout(videoTimeout);
              resolve(true);
            };
            video.onerror = () => {
              clearTimeout(videoTimeout);
              resolve(false);
            };
            video.src = url;
          });
        }

        // For other files, just check if they're accessible
        return true;
      } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
          // Timeout occurred
          return false;
        }
        throw error;
      }
    } catch (error) {
      console.warn('File validation failed:', error);
      return false;
    }
  }, [timeout]);

  useEffect(() => {
    // Only validate if enabled and rendering as card
    if (!enabled || renderAs !== 'card' || !src) {
      setHasError(false);
      setIsValidating(false);
      return;
    }

    // Don't validate while file is still uploading
    if (upload?.status === 'uploading') {
      setHasError(false);
      setIsValidating(false);
      return;
    }

    // Check cache first
    const cachedResult = getCachedResult(src);
    if (cachedResult !== null) {
      setHasError(!cachedResult);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    setHasError(false);

    const performValidation = async () => {
      try {
        // Add delay for recently uploaded files to allow server processing
        const isRecentUpload = upload?.status === 'success';
        if (isRecentUpload) {
          await new Promise(resolve => setTimeout(resolve, validationDelay));
        }

        const isValid = await validateFile(src, fileType);
        setCachedResult(src, isValid);
        setHasError(!isValid);
      } catch (error) {
        console.warn('File validation error:', error);
        setHasError(true);
      } finally {
        setIsValidating(false);
      }
    };

    void performValidation();
  }, [src, fileType, renderAs, enabled, upload?.status, validateFile, getCachedResult, setCachedResult, validationDelay]);

  return { hasError, isValidating };
};

// Utility function to clear the validation cache
export const clearFileValidationCache = (): void => {
  validationCache.clear();
};

// Utility function to get cache size (for debugging)
export const getFileValidationCacheSize = (): number => {
  return validationCache.size;
}; 