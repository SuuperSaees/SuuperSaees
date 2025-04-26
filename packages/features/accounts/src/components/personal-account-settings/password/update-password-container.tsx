'use client';

import { useTranslation } from 'react-i18next';

import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert } from '@kit/ui/alert';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { AuthLayout } from '../../../../../../../apps/web/app/auth/components/auth-layout';
import { useAuthDetails } from '../../../../../auth/src/hooks/use-auth-details';
import { UpdatePasswordForm } from './update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
  }>,
) {
  const { data: user, isPending } = useUser();
  const host = window.location.host;
  const { authDetails, isLoading } = useAuthDetails(host);
  if (isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (!user) {
    return null;
  }

  const canUpdatePassword = user.identities?.some(
    (item) => item.provider === `email`,
  );

  if (!canUpdatePassword) {
    return <WarnCannotUpdatePasswordAlert />;
  }

  return (
    <AuthLayout
      authDetails={authDetails}
      isLoading={isLoading}
    >
      <UpdatePasswordForm callbackPath={props.callbackPath} user={user} />
    </AuthLayout>
  );
}

function WarnCannotUpdatePasswordAlert() {
  const { t } = useTranslation('account');
  return <Alert variant={'warning'}>{t('cannotUpdatePassword')}</Alert>;
}
