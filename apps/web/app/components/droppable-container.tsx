import React from 'react';

import { useDroppable } from '@dnd-kit/core';

export default function Droppable({
  id,
  children,
  data,
}: {
  id: string | number;
  children: React.ReactNode;
  data: {
    id: string | number;
    [key: string]: unknown;
  };
}) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data,
  });
  const style = {
    color: isOver ? '#dddddd' : undefined,
  };

  // console.log('isOver', isOver, active);
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
