import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { FileRendererProps } from './index';
import { cn } from '@kit/ui/utils';

export const ImageRenderer: React.FC<FileRendererProps> = ({ src, fileName, className, isDialog }) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageError, setImageError] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDialog) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
      setIsZoomedIn((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleDialogClose = () => {
      setIsZoomedIn(false);
    };

    document.addEventListener('dialogClose', handleDialogClose);

    return () => {
      document.removeEventListener('dialogClose', handleDialogClose);
    };
  }, []);

  if (!isDialog) {
    return (
        <Image
          src={imageError ? '/images/fallbacks/image-fallback.webp' : src}
          alt={fileName}
          width={150}
          height={150}
          className={cn('aspect-square object-contain bg-gray-200 rounded-lg w-[150px] h-[150px]', className)}
          onError={() => setImageError(true)}
        />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative flex aspect-square max-h-full max-w-full items-center justify-center overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onClick={handleImageClick}
      style={{ cursor: isZoomedIn ? 'zoom-out' : 'zoom-in' }}
    >
      <img
          src={src}
          alt={fileName}
        className={'w-full h-full transition-transform duration-200'}
          style={{
            transform: isZoomedIn ? `scale(2)` : 'scale(1)',
            transformOrigin: isZoomedIn
              ? `${mousePosition.x}% ${mousePosition.y}%`
              : 'center',
          }}
        />
    </div>
  );
}; 