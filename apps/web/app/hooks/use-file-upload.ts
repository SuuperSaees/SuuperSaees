'use client';

import { useState, useRef } from 'react';

import * as tus from 'tus-js-client';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

/**
 * Represents the state of a file upload
 * @interface FileUploadState
 */
export interface FileUploadState {
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Current status of the upload */
  status: 'idle' | 'uploading' | 'success' | 'error';
  /** The final URL of the uploaded file (null while uploading) */
  url: string | null;
  /** The file that is being uploaded */
  file: File;
  /** The id of the upload */
  id: string;
}

/**
 * Configuration options for file upload
 * @interface FileUploadOptions
 */
export interface FileUploadOptions {
  /** The Supabase storage bucket name */
  bucketName: string;
  /** The path within the bucket where the file will be stored */
  path: string;
  /** The name of the file to be stored */
  filePath?: string;
  /** Optional chunk size for resumable uploads (in bytes) */
  chunkSize?: number;
  /** Optional cache control header value */
  cacheControl?: string;
  /** Optional callback for upload progress updates */
  onProgress?: (progress: number, updatedUpload: FileUploadState) => void;
  /** Optional callback for upload error */
  onError?: (error: Error, errorUpload: FileUploadState) => void;
}

/**
 * Custom hook for handling resumable file uploads to Supabase storage
 *
 * @returns {Object} Upload state and control functions
 * @property {Record<string, FileUploadState>} uploads - Current state of all uploads
 * @property {Function} upload - Function to start a new file upload
 * @property {Function} cancelUpload - Function to cancel an active upload
 *
 * @example
 * ```tsx
 * const { upload, uploads, cancelUpload } = useFileUpload();
 *
 * // Start an upload
 * const handleUpload = async (file: File) => {
 *   const fileId = crypto.randomUUID();
 *   await upload(file, fileId, {
 *     bucketName: 'my-bucket',
 *     path: 'uploads',
 *     onProgress: (progress) => console.log(`Upload progress: ${progress}%`)
 *   });
 * };
 *
 * // Cancel an upload
 * const handleCancel = (fileId: string) => {
 *   cancelUpload(fileId);
 * };
 * ```
 */
export function useFileUpload() {
  const [uploads, setUploads] = useState<Record<string, FileUploadState>>({});
  const activeUploads = useRef<Record<string, tus.Upload>>({});
  const supabase = useSupabase();

  /**
   * Cancels an active upload
   * @param fileId - The ID of the file upload to cancel
   */
     const cancelUpload = (fileId: string) => {
     const activeUpload = activeUploads.current[fileId];
     if (activeUpload) {
       void activeUpload.abort();
       delete activeUploads.current[fileId];
       
       // Update upload state to cancelled
       setUploads((prev) => {
         const { [fileId]: _, ...rest } = prev;
         return rest;
       });
     }
   };

  /**
   * Uploads a file using TUS protocol for resumable uploads
   *
   * @param {File} file - The file to upload
   * @param {string} fileId - Unique identifier for the upload
   * @param {FileUploadOptions} options - Upload configuration options
   * @returns {Promise<string>} The final path of the uploaded file
   * @throws {Error} If no authentication session is found or upload fails
   */
  const upload = async (
    file: File,
    fileId: string,
    options: FileUploadOptions,
  ): Promise<string> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('No authentication session found');
    }

    // Initialize upload state
    setUploads((prev) => ({
      ...prev,
      [fileId]: {
        progress: 0,
        status: 'uploading',
        url: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        file,
        id: fileId,
      },
    }));

    const filePath = `${options.path}/${options.filePath ?? fileId}`;
    const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${options.bucketName}/${filePath}`;
    
    return new Promise((resolve, reject) => {
      // Configure TUS upload
      const tusUpload = new tus.Upload(file, {
        endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          'x-upsert': 'true',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: options.bucketName,
          objectName: filePath,
          contentType: file.type,
          cacheControl: options.cacheControl ?? '3600',
        },
        chunkSize: options.chunkSize ?? 6 * 1024 * 1024, // 6MB default
        onError: (error) => {
          console.error('Error uploading file:', error);
          delete activeUploads.current[fileId];
          setUploads((prev) => {
            const errorUpload = {
              ...prev[fileId],
              progress: prev[fileId]?.progress ?? 0,
              status: 'error' as const,
              url: null,
              file: prev[fileId]?.file ?? file,
              id: prev[fileId]?.id ?? fileId,
            }
            options.onError?.(error, errorUpload);
            return {
              ...prev,
              [fileId]: errorUpload,
            };
          });
          reject(error);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const progress = Number(
            ((bytesUploaded / bytesTotal) * 100).toFixed(2),
          );

          setUploads((prev) => {
            const updatedUpload: FileUploadState = {
              ...prev[fileId],
              progress,
              status: progress === 100 ? 'success' : 'uploading',
              url: progress === 100 ? fileUrl : file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
              file: prev[fileId]?.file ?? file,
              id: prev[fileId]?.id ?? fileId,
            };
            options.onProgress?.(progress, updatedUpload);

            return {
              ...prev,
              [fileId]: updatedUpload,
            };
          });
        },
        onSuccess: () => {
          delete activeUploads.current[fileId];
          resolve(filePath);
        },
      });

      // Store reference for potential cancellation
      activeUploads.current[fileId] = tusUpload;

      // Check for previous uploads to resume
      void tusUpload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length && previousUploads[0]) {
          tusUpload.resumeFromPreviousUpload(previousUploads[0]);
        }
        tusUpload.start();
      });
    });
  };

  return {
    uploads,
    upload,
    cancelUpload,
  };
}
