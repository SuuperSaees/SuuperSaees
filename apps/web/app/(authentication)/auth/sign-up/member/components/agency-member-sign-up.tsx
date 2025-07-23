'use client';

import { useState, useEffect } from 'react';
import { AppLogo } from '~/components/app-logo';
import { useAuthDetails } from '@kit/auth/sign-in';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { WhiteLabelAgencyMemberSignUpForm } from 'node_modules/@kit/auth/src/components/white-label-agency-member-sign-up-form';
import { SkeletonPasswordSignInForm } from 'node_modules/@kit/auth/src/components/skeleton-password-sign-in-form';

export default function AgencyMemberSignUp() {
  const [host, setHost] = useState('localhost:3000');
  const [currentAppOrigin, setCurrentAppOrigin] = useState('http://localhost:3000/');
  const [isCustomDomain, setIsCustomDomain] = useState(false);
  
  const { authDetails, isLoading, organizationId } = useAuthDetails(host);
  const originalAppOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  
  useEffect(() => {
    setHost(window.location.host);
    setCurrentAppOrigin(window.location.origin + '/');
    setIsCustomDomain(originalAppOrigin !== window.location.origin + '/');
  }, [originalAppOrigin]);
  
  const textcolor = getTextColorBasedOnBackground(
    authDetails?.background_color ?? '#ffffff',
  );

  return (
    <div 
      className={`w-full min-h-screen flex bg-white ${
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
                
                {isCustomDomain && authDetails?.logo_url && (
                  <div className="w-full flex justify-center mb-8">
                    <img
                      src={authDetails.logo_url}
                      alt="Agency Logo"
                      className="h-12 w-auto"
                    />
                  </div>
                )}
                
                <WhiteLabelAgencyMemberSignUpForm 
                  agencyId={organizationId ?? ''}
                  themeColor={authDetails?.theme_color}
                />
              </div>
            </div>

            {!isCustomDomain && (
              <footer className="w-full py-4 px-4 border-t">
                <div className="max-w-md mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
                  {/* Footer content */}
                </div>
              </footer>
            )}
          </div>
        </>
      )}
    </div>
  );
}
