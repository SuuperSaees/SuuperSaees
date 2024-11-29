import {
    SkeletonBox,
    SkeletonLineText,
  } from '../ui/skeleton';
  
  export const SkeletonCardFile = ({className, classNameBox, classNameLineText}: {className?: string, classNameLineText?: string, classNameBox?: string}) => {
    return (
      <div className={`relative flex h-fit max-h-96 w-fit max-w-xs flex-col gap-2 ${className}`}>
        <SkeletonBox className={`h-60 w-80 rounded-lg ${classNameBox}`} />
        <SkeletonLineText className={`w-[100px] ${classNameLineText}`} />
      </div>
    );
  };