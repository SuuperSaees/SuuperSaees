'use client';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';

import pathsConfig from '~/config/paths.config';

import { useAuthDetails } from '../../../../../../packages/features/auth/src/hooks/use-auth-details';
import { AuthLayout } from '../../components/auth-layout';

export function PasswordReset() {
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const { authDetails } = useAuthDetails(host);

  const { callback } = pathsConfig.auth;
  const { setPassword } = pathsConfig.app;
  const redirectPath = `${callback}?next=${setPassword}`;

  return (
    <AuthLayout authDetails={authDetails}>
      <PasswordResetRequestContainer
        redirectPath={redirectPath}
        themeColor={authDetails?.theme_color}
        backgroundColor={authDetails?.background_color}
        className="w-full"
      />
    </AuthLayout>
  );
}
