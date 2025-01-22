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
}
export default function SortableItem({
  id,
  element: Element = 'div',
  data,
  className,
  children,
}: SortableProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <Element
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={className}
    >
      {children}
    </Element>
  );
}
