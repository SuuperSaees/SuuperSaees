
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import SignUp from './components/sign-up';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signUp.label'),
  };
};

interface Props {
  searchParams: {
    invite_token?: string;
  };
}

function SignUpPage({ searchParams }: Props) {
  return <SignUp searchParams={searchParams} />;
}

export default withI18n(SignUpPage);
