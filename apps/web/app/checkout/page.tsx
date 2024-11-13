import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getTokenData } from '~/team-accounts/src/server/actions/tokens/get/get-token';

import { decodeToken } from '../../../../packages/tokens/src/decode-token';
import DetailsSide from './components/details';
import { getOrganizationSettingsByOrganizationId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import OrganizationSettingsProvider from 'node_modules/@kit/accounts/src/context/organization-settings-context';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('services:serviceCheckout'),
  };
};

async function ServiceCheckoutPage({
  searchParams: { tokenId },
}: {
  searchParams: { tokenId: string };
}) {
  const suuperLogo = process.env.NEXT_PUBLIC_SUUPER_LOGO_IMAGE;
  const token = await getTokenData(tokenId);

  const tokendecoded = decodeToken(token?.access_token ?? '');

  const organizationSettings = await getOrganizationSettingsByOrganizationId(tokendecoded.organization_id, true);

  return (
    <OrganizationSettingsProvider initialSettings={organizationSettings}>
      <PageBody className="min-h-screen flex flex-col">
        <img src={organizationSettings.find(setting => setting.key === 'logo_url')?.value ?? suuperLogo}  className='w-36 h-auto mt-4 mb-2'/>
        <div className="flex flex-col w-full items-center flex-grow mb-10">
          <div className="mb-4 w-full">
            <Separator className="w-full" />
          </div>
          <DetailsSide
            service={tokendecoded.service}
            stripeId={tokendecoded.account_id}
            organizationId={tokendecoded.organization_id}
          />
        </div>
      </PageBody>
    </OrganizationSettingsProvider>
  );
}

export default withI18n(ServiceCheckoutPage);
