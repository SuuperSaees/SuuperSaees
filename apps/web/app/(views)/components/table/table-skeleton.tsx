import {
  SkeletonBox,
  SkeletonLineText,
  SkeletonUser,
} from '~/components/ui/skeleton';

interface TableSkeletonProps {
  columns: number;
  rows: number;
  className?: string;
}

const TableSkeleton = ({ columns, rows, className }: TableSkeletonProps) => {
  return (
    <div
      className={`flex flex-col gap-4 overflow-hidden rounded-md bg-transparent bg-gray/[.04] px-6 py-4 ${className}`}
    >
      {/* Header */}
      <div className="flex w-full gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLineText key={index} className="flex-1 h-[20px]" />
        ))}
      </div>

      {/* Rows */}
      <div className="flex h-full w-full flex-col gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <TableSkeletonRow key={index} columns={columns} />
        ))}
      </div>
    </div>
  );
};

const TableSkeletonRow = ({
  columns,
  className,
}: {
  columns: number;
  className?: string;
}) => {
  return (
    <div
      className={`flex h-[64.5px] w-full gap-4 rounded-md bg-gray/[.04] p-4 ${className}`}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <TableSkeletonCell key={index} index={index} />
      ))}
    </div>
  );
};

const TableSkeletonCell = ({ index }: { index: number }) => {
  // Add different types of skeleton cells based on index
  switch (index) {
    case 0: // Title
      return (
        <div className="flex flex-1 gap-2 flex-col min-w-[100px]">
          <SkeletonLineText className="w-full" />
          <SkeletonLineText className="w-3/4" />
        </div>
      );
    case 1: // Number
      return <SkeletonLineText className="w-[40px] flex-shrink-0" />;
    case 2: // Action button (large)
      return <SkeletonBox className="h-[36px] w-[120px] flex-shrink-0" />;
    case 3: // Action button (small)
      return <SkeletonBox className="h-[36px] w-[60px] flex-shrink-0" />;
    case 4: // Avatars
      return (
        <div className="flex items-center gap-2 flex-shrink-0">
          <SkeletonUser className="h-[24px] w-[24px]" />
          <SkeletonUser className="h-[24px] w-[24px]" />
        </div>
      );
    default: // Simple text
      return <SkeletonLineText className="flex-1 min-w-[50px]" />;
  }
};

export default TableSkeleton;
