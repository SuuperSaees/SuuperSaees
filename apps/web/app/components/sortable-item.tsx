import React, { ElementType, ReactNode } from 'react';

import { Data } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableProps {
  id: string | number;
  element?: ElementType; // Accepts any valid JSX element or component
  children: ReactNode; // Accepts children to be rendered inside the component
  data?: Data;
  className?: string;
  overlayClassName?: string; // Optional className for the overlay when dragging
  styleOnDrag?: React.CSSProperties; // Optional style for the overlay when dragging
}

export default function SortableItem({
  id,
  element: Element = 'div',
  data,
  className,
  overlayClassName,
  styleOnDrag,
  children,
}: SortableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data });

  let style = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: 'relative', // Ensure positioning for overlay
  };

  style = isDragging ? { ...style, ...styleOnDrag } : style;

  return (
    <Element
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={className}
    >
      {children}
      {isDragging && overlayClassName && (
        <div
          className={
            overlayClassName +
            ' absolute bottom-0 left-0 right-0 top-0 z-[1000000]'
          }
        />
      )}
    </Element>
  );
}
