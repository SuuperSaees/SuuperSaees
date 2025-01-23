import { SkeletonLineText, SkeletonUser } from '~/components/ui/skeleton';

const KanbanSkeleton = ({ columns }: { columns: number }) => {
  return <KanbanColumnsSkeleton columns={columns} />;
};

const KanbanColumnsSkeleton = ({
  columns,
  itemsPerColumn,
}: {
  columns: number;
  itemsPerColumn?: [number, number];
}) => {
  // Default pattern of items per column would be [1, ,2, 1, ,3, 1, ,4, 1, ,5, 1, ,6, 1, ,7, 1, ,8, 1, ,9, 1, ,10]
  // which formula is (index % 2 === 0 ? 1 : Math.floor(index / 2) + 2)
  const itemsPerColumnPattern =
    itemsPerColumn ??
    Array.from({ length: columns }, (_, index) =>
      index % 2 === 0 ? 1 : Math.floor(index / 3) + 3,
    );
  return (
    <div className="flex max-w-full gap-4 p-4">
      {Array.from({ length: columns }).map((_, index) => (
        <KanbanColumnSkeleton
          key={index}
          itemCount={itemsPerColumnPattern[index]}
        />
      ))}
    </div>
  );
};

const KanbanColumnSkeleton = ({
  itemCount = Math.floor(Math.random() * 5) + 1,
}: {
  itemCount?: number;
}) => {
  // Number of items to display randomly between 1 and 5

  return (
    <div className="flex h-full max-h-screen w-full min-w-72 max-w-72 flex-col gap-2 overflow-hidden rounded-md bg-transparent bg-gray/[.04] p-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <SkeletonLineText className="h-[20px] w-[100px]" />
        <SkeletonLineText className="h-[20px] w-[20px]" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: itemCount }).map((_, index) => (
          <KanbanCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

const KanbanCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={
        'flex flex-col gap-2 rounded-md bg-gray/[.04] p-4 ' +
        `${!className?.includes('h-') ? 'min-h-[128px]' : ''} ` +
        className
      }
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between">
        <SkeletonLineText className="w-[20px]" />
        <SkeletonLineText className="h-[24px] w-[100px]" />
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-1">
        <SkeletonLineText className="w-full" />
        <SkeletonLineText className="w-1/2" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1">
        <SkeletonUser className="h-[24px] w-[24px]" />
        <SkeletonUser className="h-[24px] w-[24px]" />
        <SkeletonUser className="h-[24px] w-[24px]" />
      </div>
    </div>
  );
};

export default KanbanSkeleton;
