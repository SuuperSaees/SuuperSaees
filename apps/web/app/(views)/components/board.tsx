'use client';

import ViewConfigurations from './view-configurations';
import ViewRenderer from './view-renderer';

const Board = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      {/* Options panel */}
      <ViewConfigurations />
      <ViewRenderer />
    </div>
  );
};

export default Board;
