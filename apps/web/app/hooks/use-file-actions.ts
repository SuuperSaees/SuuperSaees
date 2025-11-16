import { useEffect, useState } from 'react';
import { getFileType, canPreviewFile } from '../lib/file-types';

interface UseFileActionsProps {
  src: string;
  fileName: string;
  fileType: string;
  bucketName?: string;
}

export const useFileActions = ({ src, fileName, fileType }: UseFileActionsProps) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const type = getFileType(fileType, fileName.split('.').pop());
  const canPreview = canPreviewFile(type);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(src);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 1000);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to fetch file');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isLinkCopied) {
      timeout = setTimeout(() => setIsLinkCopied(false), 2000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isLinkCopied]);

  return {
    isLinkCopied,
    isMenuOpen,
    canPreview,
    fileType: type,
    handleCopyLink,
    handleDownload,
    handleToggleMenu,
  };
}; 