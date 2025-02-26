import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {ServicesPageClient} from './components/services-page-client';
import { getUserRole } from '~/team-accounts/src/server/actions/members/get/get-member-account';

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
  const accountRole = await getUserRole().catch((err) => {
    console.error(`Error client, getting user role: ${err}`)
    return ''
  });
  return(
    <ServicesPageClient accountRole={accountRole} />
  )
};

export default withI18n(ServicesPage);