import { SkeletonBox, SkeletonTable } from '../ui/skeleton';

export const SkeletonOrdersSection = () => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2.5">
        {
          Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBox key={index} className="h-[206px] w-full rounded-lg max-w-sm flex-1" />
          ))
        }
      </div>
      <SkeletonTable columns={9} rows={8} />
    </div>
  )
};
