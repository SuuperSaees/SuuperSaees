import { unstable_cache as cache } from 'next/cache';

import { createCmsClient } from '@kit/cms';
import { PageBody } from '@kit/ui/page';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { DocsCards } from '~/(marketing)/docs/_components/docs-cards';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:documentation'),
  };
};

const getContentItems = cache(async (resolvedLanguage: string | undefined) => {
  const client = await createCmsClient();

  return client.getContentItems({
    collection: 'documentation',
    language: resolvedLanguage,
  });
});

async function DocsPage() {
  const { t, resolvedLanguage } = await createI18nServerInstance();
  const { items } = await getContentItems(resolvedLanguage);

  // Filter out any docs that have a parentId, as these are children of other docs
  const cards = items.filter((item) => !item.parentId);

  return (
    <PageBody>
      <div className={'flex flex-col space-y-8 xl:space-y-16'}>
        <SitePageHeader
          title={t('marketing:documentation')}
          subtitle={t('marketing:documentationSubtitle')}
        />

        <div className={'flex flex-col items-center'}>
          <div className={'container mx-auto max-w-5xl'}>
            <DocsCards cards={cards} />
          </div>
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(DocsPage);
