'use client';

import { useRouter } from 'next/navigation';
import { AppLogo } from '~/components/app-logo';
import { useAuthDetails } from '@kit/auth/sign-in';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { WhiteLabelAgencyMemberSignUpForm } from 'node_modules/@kit/auth/src/components/white-label-agency-member-sign-up-form';
import { SkeletonPasswordSignInForm } from 'node_modules/@kit/auth/src/components/skeleton-password-sign-in-form';

export default function AgencyMemberSignUp({host}: {host: string}) {
const domain = host.includes('localhost') ?  `http://${host}`: `https://${host}`;
 const isCustomDomain = process.env.NEXT_PUBLIC_SITE_URL !== domain;
  const router = useRouter();
  
  const { authDetails, isLoading, organizationId } = useAuthDetails(host);
  
  const textcolor = getTextColorBasedOnBackground(
    authDetails?.background_color ?? '#ffffff',
  );

  if(!isCustomDomain) {
    router.push('/auth/sign-up');
    return null;
  }

  return (
    <div 
      className={`flex bg-white ${
        isLoading && !authDetails && isCustomDomain ? 'items-center justify-center' : ''
      }`}
      style={{
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
              <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center">
                {!isCustomDomain && (
                  <div className="hidden md:flex w-full justify-center lg:justify-start mb-12">
                    <AppLogo/>
                  </div>
                )}
                <WhiteLabelAgencyMemberSignUpForm 
                  agencyId={organizationId ?? ''}
                  themeColor={authDetails?.theme_color}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
