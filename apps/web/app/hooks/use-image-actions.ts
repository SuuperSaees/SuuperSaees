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

  // const handleDelete = async () => {
  //   if (props.bucketName) {
  //     const url = props.src;

  //     // Find the index of the bucket name in the URL
  //     const bucketIndex = url.indexOf(props.bucketName);

  //     if (bucketIndex === -1) {
  //       console.error('Bucket name not found in the URL.');
  //       return;
  //     }

  //     // Extract the path after the bucket name
  //     const filePath = url.substring(
  //       bucketIndex + props.bucketName.length + 1,
  //     ); // Adding 1 to skip the trailing "/"

  //     if (!filePath) {
  //       console.error('File path is not found in the URL.');
  //       return;
  //     }

  //     try {
  //       // Attempt to remove the file using the correct path
  //       const { data, error } = await client.storage
  //         .from(props.bucketName)
  //         .remove([filePath]);

  //       if (error) {
  //         console.error('Error removing file:', error.message);
  //         throw new Error('Error removing file');
  //       } else {
  //         console.log('File removed successfully.', data);
  //       }
  //     } catch (error) {
  //       console.error('An error occurred while deleting the file:', error);
  //       throw new Error('An error occurred while deleting the file');
  //     }
  //   } else {
  //     console.error('Bucket name is not provided.');
  //   }

  //   return;
  // };

  // const deleteImage = useMutation({
  //   mutationFn: handleDelete,
  //   onSuccess: () => {
  //     toast.success('Success!', {
  //       description: 'Image deleted successfully.',
  //     });
  //   },
  //   onError: () => {
  //     toast.error('Error!', {
  //       description: 'Failed to delete image.',
  //     });
  //   },
  // });

  // const handleView = () => {
  //   // window.open(props.src, '_blank');
  // };
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
