import { BriefsTable } from 'node_modules/@kit/team-accounts/src/components/briefs/briefs-table';


import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function BriefsPage() {
  const briefs = await getBriefs();
  return (
    <PageBody>
      <div className="p-[35px]">
        <div className="flex items-center justify-between">
          <div className="flex-grow">
            <span>
              <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                Briefs
              </div>
            </span>
          </div>
        </div>
        {briefs ? (
          <BriefsTable briefs={briefs}  />
        ) : (
          <p>No briefs available</p>
        )}
      </div>
    </PageBody>
  );
}

export default withI18n(BriefsPage);
