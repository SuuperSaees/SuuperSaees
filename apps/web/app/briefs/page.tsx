import { PageBody } from '@kit/ui/page';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { BriefsPageClient } from './components/briefs-page-client';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('briefs:briefs');

  return {
    title,
  };
};

function BriefsPage() {
  return (
    <PageBody className="overflow-y-auto">
      <BriefsPageClient  />
    </PageBody>
  );
}

export default withI18n(BriefsPage);
