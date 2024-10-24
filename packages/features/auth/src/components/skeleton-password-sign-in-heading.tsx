import {
    SkeletonBox,
  } from '../../../../../apps/web/components/ui/skeleton';
  
  export const SkeletonPasswordSignInHeading = ({className, classNameBox,}: {className?: string, classNameBox?: string}) => {
    return (
      <div className={`relative flex h-fit max-h-96 w-fit max-w-xs flex-col gap-2 ${className}`}>
        <SkeletonBox className={`h-[63px] w-[295px] rounded-lg ${classNameBox}`} />
      </div>
    );
  };