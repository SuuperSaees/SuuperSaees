'use client';

import { useCallback, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { useAppEvents } from '@kit/shared/events';
import { useSignUpWithEmailAndPassword } from '@kit/supabase/hooks/use-sign-up-with-email-password';

import { useCaptchaToken } from '../captcha/client';
import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignUpForm } from './password-sign-up-form';

interface EmailPasswordSignUpContainerProps {
  displayTermsCheckbox?: boolean;
  defaultValues?: {
    email: string;
  };

  onSignUp?: (userId?: string) => unknown;
  emailRedirectTo: string;
  className?: string;
  showConfirmEmail?: boolean;
  currentAppOrigin?: string;
  inviteToken?: string;
}

export function EmailPasswordSignUpContainer({
  defaultValues,
  onSignUp,
  emailRedirectTo,
  displayTermsCheckbox,
  showConfirmEmail,
  className,
  currentAppOrigin,
  inviteToken,
}: EmailPasswordSignUpContainerProps) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  const currentBaseUrl = !showConfirmEmail ? currentAppOrigin : undefined;

  const signUpMutation = useSignUpWithEmailAndPassword(currentBaseUrl);
  const redirecting = useRef(false);
  const appEvents = useAppEvents();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const loading =
    signUpMutation.isPending || redirecting.current || isRedirecting;
  const [error, setError] = useState(false);
  const { t } = useTranslation('auth');

  const onSignupRequested = useCallback(
    async (credentials: {
      email: string;
      password: string;
      organizationName: string;
      repeatPassword: string;
    }) => {
      if (loading) {
        return;
      }

      try {
        setIsRedirecting(true);
        const data = await signUpMutation.mutateAsync({
          ...credentials,
          organizationName: credentials.organizationName,
          emailRedirectTo,
          captchaToken,
        });
        setError(false);
        appEvents.emit({
          type: 'user.signedUp',
          payload: {
            method: 'password',
          },
        });

        if (onSignUp) {
          onSignUp(data?.data?.user?.id);
        }

        if (data?.inviteRedirectUrl) {
          router.push(data.inviteRedirectUrl);
        } else {
          router.push(`/auth/onboarding?tokenId=${data.tokenId}`);
        }
      } catch (error) {
        console.error(error);
        setError(true);
        setIsRedirecting(false);
      } finally {
        resetCaptchaToken();
      }
    },
    [
      appEvents,
      captchaToken,
      emailRedirectTo,
      loading,
      onSignUp,
      resetCaptchaToken,
      signUpMutation,
      router,
    ],
  );

  return (
    <>
      <AuthErrorAlert
        title={t('signUp2.error.title')}
        description={t('signUp2.error.description')}
        visible={error}
        onClose={() => setError(false)}
      />

      <PasswordSignUpForm
        onSubmit={onSignupRequested}
        loading={loading}
        defaultValues={defaultValues}
        displayTermsCheckbox={displayTermsCheckbox}
        className={className}
        inviteToken={inviteToken}
      />
    </>
  );
}
