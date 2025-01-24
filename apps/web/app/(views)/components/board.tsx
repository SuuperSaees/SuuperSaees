'use client';

// import ViewConfigurations from './view-configurations';
import ViewRenderer from './view-renderer';

const Board = () => {
  return (
    <div className="flex w-full flex-col gap-2 max-h-full min-h-0 h-full overflow-x-auto">
      {/* Options panel */}
      {/* <ViewConfigurations /> */}
      <ViewRenderer />
    </div>
  );
};

export default Board;
