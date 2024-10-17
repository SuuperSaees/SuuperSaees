// import Link from 'next/link';

import { SignInMethodsContainer } from '@kit/auth/sign-in';
// import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { SignInLogo } from '@kit/auth/sign-in';

interface SignInPageProps {
  searchParams: {
    invite_token?: string;
  };
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();

  return {
    title: i18n.t('auth:signIn'),
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

  return (
    <>
      <div className="w-full  h-screen flex items-center justify-center">
        <div className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain">
        </div>
        <div className="w-[360px] md:px-[32px] ">
          <div className="pb-10"><SignInLogo /></div>
          <div className="text-gray-900 text-center text-3xl font-semibold leading-9 pb-3">
            <Trans i18nKey={'auth:signInHeading'} />
          </div>
          <SignInMethodsContainer
            providers={authConfig.providers}
            inviteToken={inviteToken}
            paths={paths}
          />
        </div>
      </div>
    </>
  );
}

export default withI18n(SignInPage);



