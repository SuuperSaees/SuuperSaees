import Image from 'next/image';

import { cn } from 'node_modules/@kit/ui/src/utils/cn';

interface EmptyStateProps {
  title: string;
  description: string;
  imageSrc: string;
  button?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  imageSrc,
  button,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'mx-auto flex h-[493px] w-full max-w-lg flex-col place-content-center items-center',
        className,
      )}
    >
      <Image src={imageSrc} alt="Illustration Card" width={220} height={160} />

      <h3 className="mb-[20px] w-full text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
        {title}
      </h3>
      <p className="mb-[16px] w-full text-center text-[16px] leading-[24px] text-[#475467]">
        {description}
      </p>
      {button && button}

      {/* <Link href="#">
        <ThemedButton>{t('addService')}</ThemedButton>
      </Link> */}
    </div>
  );
}
