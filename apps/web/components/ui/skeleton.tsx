// shimmer effect class: overflow-hidden relative isolate
// before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease]
// before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent
import React from 'react';

export const SkeletonUser = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-full bg-gray/[.06] ${className} before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent`}
    ></div>
  );
};

export const SkeletonLineText = ({
  className,
  ...rest
}: {
  className?: string;
  [key: string]: unknown;
}) => {
  return (
    <div
      className={`${className} ${!className?.includes('w-') ? 'w-[50px]': ''} relative isolate min-h-[16px]  overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent`}
      {...rest}
    ></div>
  );
};

export const SkeletonParagraph = ({ className }: { className?: string }) => {
  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <div className="relative isolate h-[16px] w-full overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent"></div>
      <div className="relative isolate h-[16px] w-full overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent"></div>
      <div className="relative isolate h-[16px] w-[80%] overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent"></div>
    </div>
  );
};

export const SkeletonBox = ({
  className,
  ...rest
}: {
  className?: string;
  [key: string]: unknown;
}) => {
  return (
    <div
      className={`relative isolate overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent ${className} `}
      {...rest}
    ></div>
  );
};

interface SkeletonCardsProps {
  count: number;
  children: React.ReactNode;
  className?: string;
}

export const SkeletonCards = ({
  count,
  children,
  className,
}: SkeletonCardsProps) => {
  return (
    <div className={` ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{children}</React.Fragment>
      ))}
    </div>
  );
};

export const SkeletonTable = ({
  className,
  columns,
  rows,
}: {
  className?: string;
  columns: number;
  rows: number;
}) => {
  return (
    <div className={`flex flex-col gap-4 bg-gray/[.04] py-4 px-6 rounded-md overflow-hidden ${className}`}>
      {/* header */}
      <div className="flex w-full gap-8 overflow-hidden">
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLineText key={index} className="h-[20px] w-full" />
        ))}
      </div>

      <div className={`flex h-full w-full flex-col gap-4`}>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow key={index} />
        ))}
      </div>
    </div>
  );
};

const SkeletonTableRow = ({ className }: { className?: string }) => {
  return <SkeletonBox className={`h-[64.5px] w-full ${className}`} />;
};
