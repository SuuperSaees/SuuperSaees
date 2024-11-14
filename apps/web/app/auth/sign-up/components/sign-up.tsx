'use client';

import Link from 'next/link';

import { useAuthDetails } from '@kit/auth/sign-in';
import { SignUpMethodsContainer } from '@kit/auth/sign-up';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { SkeletonPasswordSignInForm } from 'node_modules/@kit/auth/src/components/skeleton-password-sign-in-form';

// import { getTextColorBasedOnBackground } from "~/utils/generate-colors";

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

  const signInPath =
    pathsConfig.auth.signIn +
    (inviteToken ? `?invite_token=${inviteToken}` : '');

  let host = 'localhost:3000';

  if (typeof window !== 'undefined') {
    host = window.location.host;
  }

  const { authDetails, isLoading } = useAuthDetails(host);
  // const textcolor = getTextColorBasedOnBackground(authDetails?.background_color ?? '#ffffff')
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
      className={`from-gray-['#f2f2f2'] to-gray-['#f2f2f2'] relative flex h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-r p-8 lg:p-0`}
      style={{
        background: `linear-gradient(to right, ${authDetails?.background_color}, ${authDetails?.background_color})`,
        color: textcolor,
      }}
    >
      {!isCustomDomain && (
            <div
              className="flex hidden h-screen items-center justify-center bg-no-repeat lg:flex lg:w-full"
              style={{
                backgroundImage: "url('/images/oauth/signUpBackground_V3.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
              }}
            >
            </div>
          )}
      {isLoading && !authDetails && isCustomDomain ? (
        <SkeletonPasswordSignInForm/>
      ) : (
        <>
          <div
            className={`flex h-full items-center justify-start px-8 ${isCustomDomain ? 'mx-auto w-full flex-col gap-8' : 'flex-row lg:w-full'}`}
            style={{
              background: `linear-gradient(to right, ${authDetails?.background_color}, ${authDetails?.background_color})`,
            }}
          >
            <div
              className={`${isCustomDomain && 'shadow-lg max-w-[360px] w-full'} rounded-lg bg-white p-8 text-black lg:w-full`}
              style={{
                color: getTextColorBasedOnBackground(
                  authDetails?.auth_card_background_color
                    ? authDetails.auth_card_background_color
                    : '#ffffff',
                ),
                backgroundColor: authDetails?.auth_card_background_color
                  ? authDetails.auth_card_background_color
                  : 'white',
              }}
            >
              {!isCustomDomain && (
              <div
                className={`hidden lg:left-8 lg:top-8 lg:block lg:h-auto w-full md:object-contain`}
              >
                <AppLogo logoUrl={authDetails?.logo_url} />
              </div>
            )}
              {isCustomDomain && (
                <div className="flex w-full items-start justify-center pb-[32px]">
                  <AppLogo logoUrl={authDetails?.logo_url} />
                </div>
              )}
              {!isCustomDomain && (
                <h2
                  className={`font-inter my-12 hidden font-semibold leading-[44px] tracking-[-0.72px] lg:block ${isCustomDomain ? 'text-center text-2xl' : 'text-start text-5xl font-semibold '}`}
                >
                  <Trans i18nKey={'auth:signUpHeading'} />
                </h2>
              )}

              {!isCustomDomain && (
                <>
                  <img
                    src="/images/logo/Suuper_Logo_Small.svg"
                    alt="SuuperLogoSmall"
                    className="mb-6 lg:hidden"
                  />
                  <div className="mb-[8px] text-start text-[24px]">
                    <span className="font-inter leading-32 leading-32 mb-2 text-start text-[24px] font-semibold tracking-tight text-gray-900 lg:hidden">
                      <Trans i18nKey={'auth:suuper:title'} />
                    </span>
                  </div>
                  <div className="mb-[32px] text-start text-[16px]">
                    <span className="font-inter font-regular leading-32 leading-32 mb-[32px] text-start text-[16px] tracking-tight text-gray-900 lg:hidden">
                      <Trans i18nKey={'auth:suuper.body.line2'} /> <br></br>
                    </span>
                  </div>
                </>
              )}

              <SignUpMethodsContainer
                providers={authConfig.providers}
                displayTermsCheckbox={authConfig.displayTermsCheckbox}
                inviteToken={inviteToken}
                paths={paths}
                showConfirmAlert={!isCustomDomain}
                currentAppOrigin={currentAppOrigin}
              />

              {!isCustomDomain && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="text-xs">
                    <Trans i18nKey={'auth:alreadyHasAccountAsking'} />
                  </div>

                  <Button
                    asChild
                    variant={'link'}
                    size={'sm'}
                    className="font-bold text-indigo-500"
                  >
                    <Link href={signInPath}>
                      <Trans i18nKey={'auth:alreadyHasAccountAnswer'} />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
            {!isCustomDomain && (
              <div className="absolute bottom-8 flex hidden w-1/2 justify-between leading-5 lg:flex">
                <div className="font-inter pl-10 text-sm font-normal text-[#475467]">
                  © Suuper 2024
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-inter text-sm font-normal text-[#475467]">
                    <img src="/images/icons/mail-01.svg" alt="mailicon"></img>
                  </div>
                  <div className="font-inter pr-10 text-sm font-normal text-[#475467]">
                    soporte@suuper.co
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
