import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { headers } from "next/headers";
import AgencyMemberSignUp from './components/agency-member-sign-up';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:agencyMemberSignUp'),
  };
};

function AgencyMemberSignUpPage() {
  const headersList = headers();
  const host = headersList.get("host") ?? "";
  return <AgencyMemberSignUp host={host} />;
}

export default withI18n(AgencyMemberSignUpPage);
