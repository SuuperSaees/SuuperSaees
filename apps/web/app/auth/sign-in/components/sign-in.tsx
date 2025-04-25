'use client';

import { SignInMethodsContainer } from '@kit/auth/sign-in';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';

// import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { useAuthDetails } from '../../../../../../packages/features/auth/src/hooks/use-auth-details';

const SignIn = ({
  inviteToken,
  paths,
}: {
  inviteToken: string | undefined;
  paths: {
    callback: string;
    home: string;
    joinTeam: string;
  };
}) => {
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const { authDetails } = useAuthDetails(host);
  //   const textcolor = getTextColorBasedOnBackground(
  //     authDetails?.background_color ?? '#ffffff',

  const defaultBackgroundURL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/storage/v1/object/public/suuper/auth_sign_in_background.webp';
  const customBackgroundURL = authDetails?.auth_sign_in_background_url;
  return (
    // <AppLogo logoUrl={authDetails?.logo_url} />
    <div className="flex h-full w-full">
      {/* Left Login Container */}
      <div className="flex w-1/2 flex-col items-start justify-start p-10">
        <AppLogo
          logoUrl={authDetails?.logo_url}
          className="max-h-[30px] w-auto"
        />
        <SignInMethodsContainer
          providers={authConfig.providers}
          inviteToken={inviteToken}
          paths={paths}
          themeColor={authDetails?.theme_color}
          className="font-inter m-auto max-w-sm"
        />
      </div>

      {/* Right Image background  container*/}
      <div
        className="relative w-1/2 overflow-hidden border-[16px] border-white"
        style={{
          backgroundImage: `url(${customBackgroundURL || defaultBackgroundURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderRadius: '24px',
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-transparent opacity-50"
          style={{
            backgroundColor: authDetails?.theme_color
              ? authDetails?.theme_color
              : undefined,
          }}
        ></div>
      </div>
    </div>
  );
};

export default SignIn;
