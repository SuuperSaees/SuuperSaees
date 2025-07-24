'use client';

import { ReactNode } from 'react';

import { usePathname } from 'next/navigation';

import { useAuthDetails } from '@kit/auth/sign-in';

import { AuthLayout as AuthLayoutWrapper } from './auth/components/auth-layout';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }

  const { authDetails, isLoading } = useAuthDetails(host);
  const exlusionPaths = ['/auth/sign-up', '/auth/onboarding', '/auth/pending-approval'];
  
  if (exlusionPaths.includes(pathname)) {
    return <>{children}</>;
  }
  return (
    <AuthLayoutWrapper
      authDetails={authDetails}
      isLoading={isLoading}
      className="h-screen w-screen"
    >
      {children}
    </AuthLayoutWrapper>
  );
}
