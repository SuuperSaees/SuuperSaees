import {
    SkeletonBox,
    SkeletonCards
  } from '../../../../../apps/web/components/ui/skeleton';
  
  export const SkeletonCardPlans = ({className, classNameBox,}: {className?: string, classNameBox?: string}) => {
    return (
      <SkeletonCards className={`flex justify-center flex-col gap-8 w-full md:flex-row ${className}`} count={3}>
        <SkeletonBox className={`h-[70vh] w-96 max-w-full relative flex-col justify-between rounded-xl ${classNameBox}`} />
      </SkeletonCards>
    );
  };