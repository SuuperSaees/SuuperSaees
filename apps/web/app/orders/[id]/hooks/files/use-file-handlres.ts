import { useEffect, useState } from 'react';

interface Position {
  x: number;
  y: number;
}

export const useFileHandlers = (initialZoomLevel = 1, currentFileType: string) => {
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(initialZoomLevel);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
       if (e.code === 'Space' && !isEditable) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
     const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isEditable = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;
       if (e.code === 'Space' && !isEditable) {
        setIsSpacePressed(false);
      }
    };
  //  const handleKeyDown = (e: KeyboardEvent) => {
  //    if (e.code === 'Space' && 
  //        !(e.target instanceof HTMLInputElement) && 
  //        !(e.target instanceof HTMLTextAreaElement)) {
  //      e.preventDefault();
  //      setIsSpacePressed(true);
  //    }
  //  };
  //   const handleKeyUp = (e: KeyboardEvent) => {
  //    if (e.code === 'Space') {
  //      setIsSpacePressed(false);
  //    }
  //  };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
     return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  const handleWheel = (e: WheelEvent) => {
    const isScrollableElement = (e.target as HTMLElement)?.closest('.overflow-y-auto, .overflow-auto');
    if (isScrollableElement ?? currentFileType.startsWith('application/pdf')) return;

    e.preventDefault();
    const delta = -e.deltaY;
    const zoomFactor = 0.1;
    const newZoomLevel = zoomLevel + (delta > 0 ? zoomFactor : -zoomFactor);
    
    // Limit zoom between 0.1 and 5
    const clampedZoom = Math.min(Math.max(newZoomLevel, 0.1), 5);
    setZoomLevel(clampedZoom);
    setIsZoomedIn(clampedZoom > 1);
 };
  const handleMouseDown = (e: React.MouseEvent) => {
   e.preventDefault();
   if (!isSpacePressed) return;
   
   setIsDragging(true);
   setDragStart({
     x: e.clientX - position.x,
     y: e.clientY - position.y
   });
 };
  const handleMouseMove = (e: React.MouseEvent) => {
   if (!isDragging) return;
   setPosition({
     x: e.clientX - dragStart.x,
     y: e.clientY - dragStart.y
   });
 };
  const handleMouseUp = () => {
   setIsDragging(false);
 };
  return {
   isZoomedIn,
   zoomLevel,
   isDragging,
   position,
   isSpacePressed,
   handleWheel,
   handleMouseDown,
   handleMouseMove,
   handleMouseUp,
   resetZoom: () => setZoomLevel(1)
 };
};