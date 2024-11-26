import {
  SkeletonBox,
  SkeletonLineText,
  SkeletonUser,
} from '~/components/ui/skeleton';

export default function SkeletonReviewsSection({
  numberOfCards = 3,
}: {
  numberOfCards?: number;
}) {
  return (
    <div className="flex h-full max-h-full w-full flex-wrap gap-16 lg:flex-nowrap p-8">
      <SkeletonReviewRating />
      <div className="flex h-full w-full flex-col gap-4">
        {Array.from({ length: numberOfCards }, (_, index) => (
          <SkeletonCardReview key={index} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonReviewRating() {
  return (
    <div className="flex w-full max-w-[235.2px] flex-col gap-2 p-8">
      <SkeletonLineText className="h-4" />
      <div className="flex items-center gap-4">
        <SkeletonBox className="h-12 w-10" />
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <SkeletonBox key={'s-star' + i} className="h-4 w-4" />
            ))}
          </div>
          <SkeletonLineText className='w-full' />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardReview() {
  return (
    <div className="flex w-full gap-2 rounded-md bg-gray-100/70 px-4 py-2">
      <SkeletonUser className='h-10 w-10 shrink-0' />
      <div className="flex flex-col gap-2 w-full">
        <SkeletonLineText className="h-5 max-w-60 w-full" />
        <SkeletonLineText className="h-5 max-w-48 w-full" />
        <div className="flex flex-col gap-2">
          <SkeletonLineText className="h-5 w-full" />
          <SkeletonLineText className="h-5 w-full" />
          <SkeletonLineText className="h-5 w-full" />
          <SkeletonLineText className="h-5 w-[80%]" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonBox key={'s2-star' + i} className="h-4 w-4" />
          ))}
        </div>
      </div>
    </div>
  );
}
