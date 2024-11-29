import React, { ElementType, ReactNode } from 'react';
import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import { Data } from '@dnd-kit/core';

interface SortableProps {
    id: string | number;
    element?: ElementType; // Accepts any valid JSX element or component
    children: ReactNode; // Accepts children to be rendered inside the component
    data?: Data;
    className?: string;
}
export function Sortable({
    id,
    element: Element = 'div',
    data,
    className,
    children,

}: SortableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id, data});
  
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