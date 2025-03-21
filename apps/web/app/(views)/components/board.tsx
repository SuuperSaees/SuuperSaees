'use client';

import { cn } from 'node_modules/@kit/ui/src/utils/cn';
// import ViewConfigurations from './view-configurations';
import ViewRenderer from './view-renderer';
interface BoardProps {
  className?: string;
}
const Board = ({ className }: BoardProps) => {
  return (
    <div className={cn("flex w-full flex-col gap-2 max-h-full min-h-0 h-full overflow-x-auto", className)}>
      {/* Options panel */}
      {/* <ViewConfigurations /> */}
      <ViewRenderer />
    </div>
  );

};

export default Board;
