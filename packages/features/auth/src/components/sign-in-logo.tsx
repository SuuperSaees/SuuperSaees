'use client';

import { useAuthDetails } from '../hooks/use-auth-details';
import { AppLogo } from '../../../../../apps/web/components/app-logo';
import { SkeletonCardSignInLogo } from './skeleton-card-sign-in-logo';
import { useState, useEffect } from 'react';

export function SignInLogo() {
  let host = '';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const authDetails = useAuthDetails(host);
  const [isLoading, setIsLoading] = useState(true);

  // manage the skeleton with max time of 2000ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!authDetails?.logo_url && isLoading) {
    return <SkeletonCardSignInLogo/>;
  }

  return (
    <div className="flex justify-center items-center h-full">
        <AppLogo logoUrl={authDetails?.logo_url} />
    </div>
  );
}
