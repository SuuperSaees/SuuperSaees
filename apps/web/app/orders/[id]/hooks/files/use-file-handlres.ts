import { useState } from 'react';
import { toast } from 'sonner';

interface Position {
  x: number;
  y: number;
}

export const useFileHandlers = (initialZoomLevel = 1) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const handleDialogDownload = async (selectedFile: File | null, originalHandleDownload: () => void) => {
    try {
      if (selectedFile) {
        const response = await fetch(selectedFile.url);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedFile.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        originalHandleDownload();
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const handleZoomChange = (value: string) => {
    const zoomValue = parseFloat(value.replace('x', ''));
    setZoomLevel(zoomValue);
    setIsZoomedIn(zoomValue > 1);
    return zoomValue;
  };

  const handleMouseDown = (e: React.MouseEvent, currentZoomLevel: number) => {
    e.preventDefault();
    if (currentZoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent, currentZoomLevel: number) => {
    if (!isDragging || currentZoomLevel <= 1) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetZoomAndPosition = () => {
    setIsZoomedIn(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  return {
    isZoomedIn,
    zoomLevel,
    isDragging,
    position,
    handleDialogDownload,
    handleZoomChange,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoomAndPosition,
  };
};
