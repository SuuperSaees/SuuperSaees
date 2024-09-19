import { PricingTable } from '@kit/billing-gateway/marketing';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { BillingProviderSchema, createBillingSchema, BillingConfig } from '@kit/billing';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import useBilling from '~/home/[account]/hooks/use-billing';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:pricing'),
  };
};

const paths = {
  signUp: pathsConfig.auth.signUp,
  return: pathsConfig.app.home,
};

async function PricingPage() {
  const { t } = await createI18nServerInstance();

  const { productsDataConfig } = useBilling()

  return (
    <div className={'flex flex-col space-y-12'}>
      <SitePageHeader
        title={t('marketing:pricing')}
        subtitle={t('marketing:pricingSubtitle')}
      />

      <div className={'container mx-auto pb-8 xl:pb-16'}>
        <PricingTable paths={paths} productsDataConfig={productsDataConfig} />
      </div>
    </div>
  );
}

export default withI18n(PricingPage);
