import OrganizationSettingsProvider from 'node_modules/@kit/accounts/src/context/organization-settings-context';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { Service } from '~/lib/services.types';
import { getOrganizationSettingsByOrganizationId } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

import { decodeTokenData } from '~/team-accounts/src/server/actions/tokens/decode/decode-token';
import { PayToken } from '../../../../packages/tokens/src/domain/token-type';
import DetailsSide from './components/details';
import { getPaymentsMethods, getServiceById } from '~/team-accounts/src/server/actions/services/get/get-services';
import { getStripeAccountID } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import EmptyPaymentMethods from './components/empty-payment-methods';
import ErrorDecodedToken from './components/error-decoded-token';
import { getInvoice } from '~/server/actions/invoices/invoices.action';
import { Invoice } from '~/lib/invoice.types';
import { z } from 'zod';

const PaymentSettingsSchema = z.object({
  enableManualPayments: z.boolean(),
  paymentMethodName: z.string().min(1, 'Payment method name is required'),
  instructions: z.string().min(1, 'Instructions are required'),
});

type PaymentSettingsType = z.infer<typeof PaymentSettingsSchema>;

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

  const tokendecoded = await decodeTokenData<PayToken>(tokenId).catch((error) => {
    console.error('Error decoding token:', error);
    return null
  });
  

  if(!tokendecoded) {
    return <ErrorDecodedToken />
  }

  const organizationSettings = await getOrganizationSettingsByOrganizationId(
    tokendecoded?.organization_id ?? '',
    true,
      [
        'theme_color',
        'logo_url',
        'sidebar_background_color',
        'language',
        'favicon_url',
        'sender_name',
        'sender_domain',
        'sender_email',
        'auth_card_background_color',
        'auth_section_background_color',
        'dashboard_url',
        'parteners_url',
        'catalog_product_wholesale_url',
        'catalog_product_private_label_url',
        'training_url',
        'catalog_sourcing_china_url',
        'catalog_product_url',
        'calendar_url',
        'auth_background_url',
        'payment_details',
      ],
  );

  const logoUrl = organizationSettings.find(
    (setting) => setting.key === 'logo_url',
  )?.value;
  const sidebarBackgroundColor = organizationSettings.find(
    (setting) => setting.key === 'sidebar_background_color',
  )?.value;
  const paymentDetails = JSON.parse(organizationSettings.find(
    (setting) => setting.key === 'payment_details',
  )?.value ?? '{}') as PaymentSettingsType;

  const paymentMethods = await getPaymentsMethods(tokendecoded?.primary_owner_id ?? '', undefined, true).catch((error) => {
    console.error('Error fetching payment methods:', error);
    return {
      paymentMethods: [],
      primaryOwnerId: tokendecoded?.primary_owner_id ?? '',
    };
  });

  console.log('Payment methods:', paymentDetails);

  if(paymentDetails?.enableManualPayments && paymentDetails?.paymentMethodName && paymentDetails?.instructions) {
    paymentMethods.paymentMethods = [
      ...paymentMethods.paymentMethods,
      {
        id: 'payment_details',
        name: 'manual_payment',
        icon: 'paymentswaydirect',
        custom_name: paymentDetails?.paymentMethodName,
        description: paymentDetails?.instructions,
      } as never,
    ];
  }
  let service = null;
  let invoice = null;
  if (tokendecoded?.service?.id) {
  service = await getServiceById(tokendecoded?.service.id ?? 0, false, true, true).catch((error) => {
    console.error('Error fetching service:', error);
    return null;
  });
} else if (tokendecoded?.invoice?.id) {
  invoice = await getInvoice(tokendecoded?.invoice.id ?? '', true).catch((error) => {
    console.error('Error fetching invoice:', error);
    return null;
  });
}

  let accountId = tokendecoded?.account_id ?? '';

  if(!accountId) {
    const { stripeId } = await getStripeAccountID(tokendecoded?.primary_owner_id ?? '', true).catch((err) => {
      console.error(`Error client, getting stripe account id: ${err}`)
      return { stripeId: '' }
    });

    accountId = stripeId;
  }

  return (
    <OrganizationSettingsProvider initialSettings={organizationSettings}>
      <div
        className="flex min-h-screen w-full flex-grow flex-col items-center"
        style={{ backgroundColor: sidebarBackgroundColor }}
      >
        <div className="flex w-full max-w-[1200px] flex-col pb-10 lg:flex-row">
          {
            !paymentMethods.paymentMethods.length ? (
              <EmptyPaymentMethods logoUrl={logoUrl ?? suuperLogo ?? ''} />
            ) : (
              <DetailsSide
                service={
                  service as Service.Relationships.Billing.BillingService
                }
                invoice={invoice as Invoice.Response}
                stripeId={accountId}
                logoUrl={logoUrl ?? suuperLogo ?? ''}
                sidebarBackgroundColor={sidebarBackgroundColor ?? '#FFFFFF'}
                paymentMethods={paymentMethods.paymentMethods ?? []}
                manualPayment={
                  {
                    id: 'payment_details',
                    name: 'manual_payment',
                    icon: 'paymentswaydirect',
                    custom_name: paymentDetails?.paymentMethodName,
                    description: paymentDetails?.instructions,
                  } as never
                }
          />
            )
          }
        </div>
      </div>
    </OrganizationSettingsProvider>
  );
}

export default withI18n(ServiceCheckoutPage);
