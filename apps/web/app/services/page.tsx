import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {ServicesPageClient} from './components/services-page-client';
import { getUserRole, getStripeAccountID } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getPaymentsMethods } from '~/team-accounts/src/server/actions/services/get/get-services';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}


export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function ServicesPage(){
  const { paymentMethods, primaryOwnerId } = await getPaymentsMethods().catch(() => {
    console.error(`Error getting payments methods`)
    return { paymentMethods: [], primaryOwnerId: '' }
  });
  const { stripeId } = await getStripeAccountID(primaryOwnerId).catch((err) => {
    console.error(`Error client, getting stripe account id: ${err}`)
    return { stripeId: '' }
  });
  const organizationId = await getOrganization(primaryOwnerId).then((organization) => organization.id).catch((err) => {
    console.error(`Error client, getting organization: ${err}`)
    return ''
  })
  const accountRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  return(
    <ServicesPageClient accountRole={accountRole} paymentsMethods={paymentMethods} stripeId={stripeId} organizationId={organizationId} />
  )
};

export default withI18n(ServicesPage);