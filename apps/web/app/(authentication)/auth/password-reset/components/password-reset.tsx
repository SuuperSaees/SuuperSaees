'use client';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';

import pathsConfig from '~/config/paths.config';

import { useAuthDetails } from '@kit/auth/sign-in';
import { AuthLayout } from '../../components/auth-layout';

export function PasswordReset() {
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const { authDetails, isLoading } = useAuthDetails(host);

  const { callback } = pathsConfig.auth;
  const { setPassword } = pathsConfig.app;
  const redirectPath = `${callback}?next=${setPassword}`;

  return (
    <AuthLayout
      authDetails={authDetails}
      isLoading={isLoading}
    >
      <PasswordResetRequestContainer
        redirectPath={redirectPath}
        themeColor={authDetails?.theme_color}
        backgroundColor={authDetails?.background_color}
        className="w-full"
      />
    </AuthLayout>
  );
}
