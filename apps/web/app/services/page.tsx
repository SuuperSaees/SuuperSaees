import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {ServicesPageClient} from './components/services-page-client';
import { loadStripe } from '@stripe/stripe-js';
import { getStripeAccountID, getUserRole } from '~/team-accounts/src/server/actions/members/get/get-member-account';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error("Stripe public key is not defined in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('services:serviceTitle');

  return {
    title,
  };
};

async function ServicesPage(){
  const accountRole = await getUserRole();
  const organizationData = await getOrganization();
  const stripeId = await getStripeAccountID();
  return(
    <ServicesPageClient stripePromise={stripePromise} accountRole={accountRole} stripeId={stripeId.stripeId} organizationId={organizationData.id}/>
  )
};

export default withI18n(ServicesPage);