'use client';

import { useAuthDetails } from '@kit/auth/sign-in';
import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Trans } from '@kit/ui/trans';
import { SkeletonPasswordSignInForm } from 'node_modules/@kit/auth/src/components/skeleton-password-sign-in-form';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';

interface Props {
  searchParams: {
    invite_token?: string;
  };
}
const paths = {
  callback: pathsConfig.auth.callback,
  appHome: pathsConfig.app.home,
};
export default function SignUp({ searchParams }: Props) {
  const inviteToken = searchParams.invite_token;
  let host = 'localhost:3000';

  if (typeof window !== 'undefined') {
    host = window.location.host;
  }

  const { authDetails, isLoading } = useAuthDetails(host);
  const originalAppOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  let currentAppOrigin = 'http://localhost:3000/';
  if (typeof window !== 'undefined') {
    currentAppOrigin = window.location.origin + '/';
  }
  const isCustomDomain = originalAppOrigin !== currentAppOrigin;
  const textcolor = getTextColorBasedOnBackground(
    authDetails?.background_color ?? '#ffffff',
  );

  return (
    <div 
      className={`w-full min-h-screen flex bg-white ${
        isLoading && !authDetails && isCustomDomain ? 'items-center justify-center' : ''
      }`}
      style={{
        // background: `linear-gradient(to right, ${authDetails?.background_color}, ${authDetails?.background_color})`,
        color: textcolor,
      }}
    >
       {isLoading && !authDetails && isCustomDomain ? (
        <SkeletonPasswordSignInForm/>
      ) : (
        <>
          {!isCustomDomain && (
            <div className="hidden lg:block lg:w-1/2 relative">
              <img
                src="/images/oauth/signUpBackground.avif"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          )}

          <div className={`w-full flex flex-col ${isCustomDomain ? 'items-center' : 'lg:w-1/2'}`}>
            <div className="flex-1 px-4 py-6 sm:px-6 md:px-8 flex flex-col">
              {!isCustomDomain && (
                <div className="hidden md:block w-full flex justify-center lg:justify-start mb-6">
                  <AppLogo/>
                </div>
              )}

              <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
                {!isCustomDomain ? (
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center lg:text-left mb-8">
                    <Trans i18nKey={'auth:signUpHeading'} />
                  </h2>
                ) : null}
                {isCustomDomain && (
                  <div className="flex justify-center mb-8">
                    <AppLogo logoUrl={authDetails?.logo_url} />
                  </div>
                )}
                <SignUpMethodsContainer
                  providers={authConfig.providers}
                  displayTermsCheckbox={authConfig.displayTermsCheckbox}
                  inviteToken={inviteToken}
                  paths={paths}
                />
              </div>
            </div>

            {!isCustomDomain ? (
              <footer className="w-full py-4 px-4 border-t">
                <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-sm text-gray-600">© Suuper 2024</div>
                  <div className="flex items-center gap-2">
                    <img 
                      src="/images/icons/mail-01.svg" 
                      alt="mail icon"
                      className="w-5 h-5"
                    />
                    <span className="text-sm text-gray-600">soporte@suuper.co</span>
                  </div>
                </div>
              </footer>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
