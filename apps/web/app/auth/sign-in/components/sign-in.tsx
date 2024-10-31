'use client';

import { SignInLogo } from '@kit/auth/sign-in';
import { SignInMethodsContainer } from '@kit/auth/sign-in';

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
  //   );
  return (
    <>
      <div
        className={`from-gray-['#f2f2f2'] to-gray-['#f2f2f2'] relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-r`}
        style={{
          background: `linear-gradient(to right, ${authDetails?.background_color}, ${authDetails?.background_color})`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="from-gray-['#f2f2f2'] to-gray-['#f2f2f2'] absolute w-full animate-pulse bg-gradient-to-r opacity-100" />
        </div>

        <div className="absolute hidden md:left-8 md:top-8 md:block md:h-auto md:w-[142px] md:object-contain"></div>

        <div
          className={`align-center relative z-10 w-[90%] max-w-[360px] rounded-lg bg-white text-black shadow-lg backdrop-blur-[95%] md:px-[32px] md:py-[48px] bg-white`}
          style={{
            color: 'black',
            padding: '32px', // Additional padding for the form
          }}
        >
          <div className="flex w-full items-start justify-center pb-[32px]">
            <SignInLogo />
          </div>
          <div className="h-auto text-black">
            <SignInMethodsContainer
              providers={authConfig.providers}
              inviteToken={inviteToken}
              paths={paths}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
