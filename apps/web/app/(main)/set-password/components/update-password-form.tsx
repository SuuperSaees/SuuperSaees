'use client';

import { useTranslation } from 'react-i18next';

import { useUser } from '@kit/supabase/hooks/use-user';
import { Alert } from '@kit/ui/alert';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { UpdatePasswordForm } from 'node_modules/@kit/accounts/src/components/personal-account-settings/password/update-password-form';

export function UpdatePasswordFormContainer(
  props: React.PropsWithChildren<{
    callbackPath: string;
    className?: string;
  }>,
) {
  const { data: user, isPending } = useUser();
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
      <UpdatePasswordForm callbackPath={props.callbackPath} user={user} className={props.className} />
  );
}

function WarnCannotUpdatePasswordAlert() {
  const { t } = useTranslation('account');
  return <Alert variant={'warning'}>{t('cannotUpdatePassword')}</Alert>;
}
