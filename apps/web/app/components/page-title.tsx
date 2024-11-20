
import { Trans } from '@kit/ui/trans';
import { OrderTimer } from './timer';

interface PageTitleProps {
  i18nKey: string;
}

export function PageTitle({ i18nKey }: PageTitleProps) {
  return (
    <div className="mb-[36px] flex items-center justify-between">
      <div className="flex w-full justify-between">
        <div className="font-inter text-[30px] font-semibold leading-[44px] tracking-[-0.72px] text-primary-900">
          <Trans i18nKey={i18nKey} />
        </div>
        <OrderTimer />
      </div>
    </div>
  );
}