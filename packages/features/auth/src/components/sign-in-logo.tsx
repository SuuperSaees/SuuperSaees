'use client';

import { useAuthDetails } from '../hooks/use-auth-details';
import { AppLogo } from '../../../../../apps/web/components/app-logo';

export function SignInLogo() {
  let host = '';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const authDetails = useAuthDetails(host);
  return (
    <div className="flex justify-center items-center h-full">
      <AppLogo logoUrl={authDetails?.logo_url} />
    </div>
  );
}
