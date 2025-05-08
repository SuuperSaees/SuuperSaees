import { useEffect, useState } from 'react';

interface UseImageActionsProps {
  src: string;
  bucketName?: string;
}

export const useImageActions = ({ src }: UseImageActionsProps) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getFileName = (src: string) => {
    const urlParts = src.split('/').pop()?.split('.') ?? [];
    const fileName = urlParts.slice(0, -1).join('.') ?? '';
    return fileName;
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(src);
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 1000); // Show check icon for 1 second
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to fetch image');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${getFileName(src)}`; // Set the filename for the downloaded file
      link.click();

      window.URL.revokeObjectURL(url); // Clean up the object URL
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
      timeout = setTimeout(() => setIsLinkCopied(false), 2000); // Show check icon for 2 seconds
    }

    return () => {
      clearTimeout(timeout); // Clear timeout when component unmounts or on re-render
    };
  }, [isLinkCopied]);

  return {
    isLinkCopied,
    isMenuOpen,
    handleCopyLink,
    handleDownload,
    handleToggleMenu,
    // handleDelete,
  };
};
