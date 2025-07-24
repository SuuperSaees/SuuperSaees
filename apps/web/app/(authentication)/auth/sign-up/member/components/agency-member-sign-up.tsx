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
    <div>
      {isLoading && !authDetails && isCustomDomain ? (
        <SkeletonPasswordSignInForm/>
      ) : (
        <>
        <WhiteLabelAgencyMemberSignUpForm 
            agencyId={organizationId ?? ''}
            themeColor={authDetails?.theme_color}
          />
        </>
      )}
    </div>
  );
}
