import Image from 'next/image';

export default function EmptyState({
  title,
  description,
  imageSrc,
}: {
  title: string;
  description: string;
  imageSrc: string;
}) {
  return (
    <div className="flex h-[493px] flex-col place-content-center items-center">
      <Image src={imageSrc} alt="Illustration Card" width={220} height={160} />
      <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
        {title}
      </h3>
      <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
        {description}
      </p>

      {/* <Link href="#">
        <ThemedButton>{t('addService')}</ThemedButton>
      </Link> */}
    </div>
  );
}
