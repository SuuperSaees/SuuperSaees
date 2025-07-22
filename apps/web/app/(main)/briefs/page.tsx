import { PageBody } from '@kit/ui/page';

import { PageHeader } from '~/(main)/../components/page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import BriefsTable from './components/table';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('briefs:briefs');

  return {
    title,
  };
};

async function BriefsPage() {
  const initialData = await getBriefs({
    includes: ['services'],
    pagination: { limit: 100, page: 1 },
  });
  return (
    <PageBody className="overflow-y-auto">
      <PageHeader
        title="briefs:briefs"
        className="w-full"
      />
      <BriefsTable initialData={initialData} />
    </PageBody>
  );
}

export default withI18n(BriefsPage);
