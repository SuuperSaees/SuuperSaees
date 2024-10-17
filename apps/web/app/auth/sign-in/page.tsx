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
  <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-r from-gray-250 to-gray-150">
    {/* Círculo animado en el fondo */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="absolute w-full h-full bg-gradient-to-r from-gray-100 to-gray-400  opacity-30 animate-pulse" />
    </div>

    <div className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain"></div>
    
    <div className="relative w-[360px] md:px-[32px] md:py-[48px] backdrop-blur-md bg-white/85 rounded-lg shadow-lg z-10">
      <div className="flex justify-start items-start pb-[32px] max-w-[140px]">
        <SignInLogo />
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



