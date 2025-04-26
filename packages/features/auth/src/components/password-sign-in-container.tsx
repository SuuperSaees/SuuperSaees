'use client';

import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { useSignInWithEmailPassword } from '@kit/supabase/hooks/use-sign-in-with-email-password';

import { useCaptchaToken } from '../captcha/client';
import type { PasswordSignInSchema } from '../schemas/password-sign-in.schema';
import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignInForm } from './password-sign-in-form';

export function PasswordSignInContainer({
  onSignIn,
  themeColor,
  className,
}: {
  onSignIn?: (userId?: string) => unknown;
  themeColor: string | undefined;
  className?: string;
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInMutation = useSignInWithEmailPassword();
  const isLoading = signInMutation.isPending;
  const { t } = useTranslation('auth');
  const [error, setError] = useState(false);
  const onSubmit = useCallback(
    async (credentials: z.infer<typeof PasswordSignInSchema>) => {
      try {
        const data = await signInMutation.mutateAsync({
          ...credentials,
          options: { captchaToken },
        });

        if (onSignIn) {
          const userId = data?.user?.id;

          onSignIn(userId);
        }
        setError(false);
      } catch (e) {
        // wrong credentials, do nothing
        setError(true);
      } finally {
        resetCaptchaToken();
      }
    },
    [captchaToken, onSignIn, resetCaptchaToken, signInMutation],
  );

  return (
    <>
      <AuthErrorAlert
        title={t('signIn.error.title')}
        description={t('signIn.error.description')}
        visible={error}
        onClose={() => setError(false)}
      />

      <PasswordSignInForm
        onSubmit={onSubmit}
        loading={isLoading}
        themeColor={themeColor}
        className={className}
      />
    </>
  );
}
