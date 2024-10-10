import { ElementType, ReactNode } from 'react';



import { useDraggable } from '@dnd-kit/core';


interface DraggableProps {
  id: string;
  element?: ElementType; // Accepts any valid JSX element or component
  children: ReactNode; // Accepts children to be rendered inside the component
  data: {
    id: number;
  };
}

export default function Draggable({
  id,
  element: Element = 'div',
  data,
  children,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id, data });

  return (
    <Element ref={setNodeRef} {...listeners} {...attributes}>
      {children}
    </Element>
  );
}