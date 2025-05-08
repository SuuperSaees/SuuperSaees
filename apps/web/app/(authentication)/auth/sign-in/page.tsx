import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import SignIn from './components/sign-in';

interface SignInPageProps {
  searchParams: {
    invite_token?: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn.label'),
  };
};

const paths = {
  callback: pathsConfig.auth.callback,
  home: pathsConfig.app.home,
  joinTeam: pathsConfig.app.joinTeam,
};

function SignInPage({ searchParams }: SignInPageProps) {
  const inviteToken = searchParams.invite_token;
  // const signUpPath =
  //   pathsConfig.auth.signUp +
  //   (inviteToken ? `?invite_token=${inviteToken}` : '');

  return <SignIn inviteToken={inviteToken} paths={paths}></SignIn>;
}

export default withI18n(SignInPage);
