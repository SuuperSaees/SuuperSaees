import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import DetailsSide from './components/details';
import { getOrganizationSettingsByOrganizationId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';
import OrganizationSettingsProvider from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { decodeTokenData } from '../../../../packages/features/team-accounts/src/server/actions/tokens/decode/decode-token';
import { PayToken } from '../../../../packages/tokens/src/domain/token-type';
import { Service } from '~/lib/services.types';

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

  const tokendecoded = await decodeTokenData<PayToken>(tokenId);

  const organizationSettings = await getOrganizationSettingsByOrganizationId(
    tokendecoded?.organization_id ?? '',
    true,
  );
  const logoUrl = organizationSettings.find(
    (setting) => setting.key === 'logo_url',
  )?.value;
  const sidebarBackgroundColor = organizationSettings.find(
    (setting) => setting.key === 'sidebar_background_color',
  )?.value;

  return (
    <OrganizationSettingsProvider initialSettings={organizationSettings}>
      <div
        className="flex min-h-screen w-full flex-grow flex-col items-center"
        style={{ backgroundColor: sidebarBackgroundColor }}
      >
        <div className="flex w-full max-w-[1200px] flex-col lg:flex-row pb-10">
          <DetailsSide
            service={
              tokendecoded?.service as Service.Relationships.Billing.BillingService
            }
            stripeId={tokendecoded?.account_id ?? ''}
            organizationId={tokendecoded?.organization_id ?? ''}
            logoUrl={logoUrl ?? suuperLogo ?? ''}
            sidebarBackgroundColor={sidebarBackgroundColor ?? '#FFFFFF'}
            paymentMethods={tokendecoded?.payment_methods ?? []}
          />
        </div>
      </div>
    </OrganizationSettingsProvider>
  );
}

export default withI18n(ServiceCheckoutPage);
