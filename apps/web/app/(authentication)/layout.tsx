'use client';

import { ReactNode } from 'react';

import { useAuthDetails } from '@kit/auth/sign-in';
import { usePathname } from 'next/navigation';

import { AuthLayout as AuthLayoutWrapper } from './auth/components/auth-layout';

export default function AuthLayout({ children }: { children: ReactNode }) {

  const pathname = usePathname();
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }

  const { authDetails, isLoading } = useAuthDetails(host);

  return (
    <>
      {pathname === '/auth/sign-up' ? (
        children
      ) : (
        <AuthLayoutWrapper authDetails={authDetails} isLoading={isLoading} className="h-screen w-screen">
          {children}
        </AuthLayoutWrapper>
      )}
    </>
  );
}
