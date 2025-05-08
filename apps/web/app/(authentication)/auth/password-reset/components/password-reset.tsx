'use client';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';
import { useAuthDetails } from '@kit/auth/sign-in';

import pathsConfig from '~/config/paths.config';

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
    <PasswordResetRequestContainer
      redirectPath={redirectPath}
      themeColor={authDetails?.theme_color}
      backgroundColor={authDetails?.background_color}
      className="w-full"
    />
  );
}
