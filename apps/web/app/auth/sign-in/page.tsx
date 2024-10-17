'use client'; // Este archivo es un componente de cliente

import { SignInMethodsContainer } from '@kit/auth/sign-in';
import { Trans } from '@kit/ui/trans';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { SignInLogo } from '@kit/auth/sign-in';
import { useAuthDetails } from '../../../../../packages/features/auth/src/hooks/use-auth-details';

interface SignInPageProps {
  searchParams: {
    invite_token?: string;
  };
}

const paths = {
  callback: pathsConfig.auth.callback,
  home: pathsConfig.app.home,
  joinTeam: pathsConfig.app.joinTeam,
};

function SignInPage({ searchParams }: SignInPageProps) {
  const inviteToken = searchParams.invite_token;
  
  // Obtener el host en el cliente
  const host = typeof window !== 'undefined' ? window.location.host : '';

  // Llamar al hook en el cliente
  const authDetails = useAuthDetails(host);

  return (
    <>
      <div className={`w-full h-screen flex items-center justify-center ${authDetails?.theme_color}`}>
        <div className="hidden md:block absolute md:w-[142px] md:h-auto md:left-8 md:top-8 md:object-contain"></div>
        <div className="w-[360px] md:px-[32px]">
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

export default SignInPage;
