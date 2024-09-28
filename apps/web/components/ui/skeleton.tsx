// shimmer effect class: overflow-hidden relative isolate
// before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease]
// before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent

export const SkeletonUser = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative isolate h-[20px] w-[20px] overflow-hidden rounded-full bg-gray/[.06] ${className} before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent`}
    ></div>
  );
};

export const SkeletonLineText = ({ className }: { className?: string }) => {
  return (
    <div
      className={`${className} relative isolate min-h-[16px] min-w-[50px] overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent`}
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

export const SkeletonBox = ({ className }: { className?: string }) => {
  return (
    <div
      className={`relative isolate overflow-hidden rounded bg-gray/[.06] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1s_infinite_ease] before:bg-gradient-to-r before:from-transparent before:via-gray/[.05] before:to-transparent ${className} `}
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
        <div key={index}>{children}</div>
      ))}
    </div>
  );
};
