import {
    SkeletonBox,
    SkeletonCards
  } from '~/components/ui/skeleton';
  
  export const SkeletonCardPlans = ({className, classNameBox,}: {className?: string, classNameBox?: string}) => {
    return (
      <SkeletonCards className={`flex justify-center flex-col gap-8 w-full md:flex-row ${className}`} count={3}>
        <SkeletonBox className={`h-[70vh] max-w-96 min-w-80 relative flex-col justify-between rounded-xl ${classNameBox}`} />
      </SkeletonCards>
    );
  };