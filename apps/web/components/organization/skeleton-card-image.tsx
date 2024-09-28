import {
  SkeletonBox,
  SkeletonLineText,
  SkeletonParagraph,
} from '../ui/skeleton';

export const SkeletonCardService = () => {
  return (
    <div className="relative flex h-fit max-h-96 w-fit max-w-xs flex-col gap-2">
      <SkeletonBox className="h-60 w-80 rounded-lg" />
      <SkeletonLineText className="w-[100px]" />
      <SkeletonParagraph />
    </div>
  );
};
