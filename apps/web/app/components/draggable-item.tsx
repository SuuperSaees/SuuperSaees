import { ElementType, ReactNode } from 'react';

import { Data, useDraggable } from '@dnd-kit/core';

interface DraggableProps {
  id: string | number;
  element?: ElementType; // Accepts any valid JSX element or component
  children: ReactNode; // Accepts children to be rendered inside the component
  data?: Data;
  className?: string;
}

export default function DraggableItem({
  id,
  element: Element = 'div',
  data,
  className,
  children,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id,
    data,
  });

  return (
    <Element
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      // style={style}
      className={className}
    >
      {children}
    </Element>
  );
}
