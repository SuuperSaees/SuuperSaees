import { BellIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

interface PageHeaderProps {
  i18nKey?: string | string[] | undefined;
}
const PageHeader = ({ i18nKey }: PageHeaderProps) => {
  return (
    <div className="mb-[32px] flex items-center justify-between">
      <div className="flex-grow">
        <span>
          <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
            <Trans i18nKey={i18nKey} />
          </div>
        </span>
      </div>
    </div>
  );
};

export default withI18n(PageHeader);
