'use client';

import { SignInMethodsContainer } from '@kit/auth/sign-in';

import authConfig from '~/config/auth.config';

import { useAuthDetails } from '../../../../../../packages/features/auth/src/hooks/use-auth-details';
import { AuthLayout } from '../../components/auth-layout';

const SignIn = ({
  inviteToken,
  paths,
}: {
  inviteToken: string | undefined;
  paths: {
    callback: string;
    home: string;
    joinTeam: string;
  };
}) => {
  let host = 'localhost:3000';
  if (typeof window !== 'undefined') {
    host = window.location.host;
  }
  const { authDetails } = useAuthDetails(host);

  return (
    <AuthLayout authDetails={authDetails}>
      <SignInMethodsContainer
        providers={authConfig.providers}
        inviteToken={inviteToken}
        paths={paths}
        themeColor={authDetails?.theme_color}
        className="w-full"
      />
    </AuthLayout>
  );
};

export default SignIn;
