import { Trans } from '@kit/ui/trans';

interface PageTitleProps {
  i18nKey: string;
}

export function PageTitle({ i18nKey }: PageTitleProps) {
  return (
    <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
      <Trans i18nKey={i18nKey} />
    </div>
  );
}

