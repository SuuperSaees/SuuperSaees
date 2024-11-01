'use client';

import { useCallback, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { CheckCircledIcon } from '@radix-ui/react-icons';

import { useAppEvents } from '@kit/shared/events';
import { useSignUpWithEmailAndPassword } from '@kit/supabase/hooks/use-sign-up-with-email-password';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

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
}

export function EmailPasswordSignUpContainer({
  defaultValues,
  onSignUp,
  emailRedirectTo,
  displayTermsCheckbox,
  showConfirmEmail,
  className
}: EmailPasswordSignUpContainerProps) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();

  const signUpMutation = useSignUpWithEmailAndPassword();
  const redirecting = useRef(false);
  const [showVerifyEmailAlert, setShowVerifyEmailAlert] = useState(false);
  const appEvents = useAppEvents();
  const router = useRouter();
  const loading = signUpMutation.isPending || redirecting.current;

  const onSignupRequested = useCallback(
    async (credentials: { email: string; password: string }) => {
      if (loading) {
        return;
      }

      try {
        const data = await signUpMutation.mutateAsync({
          ...credentials,
          emailRedirectTo,
          captchaToken,
        });

        showConfirmEmail && setShowVerifyEmailAlert(true);

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
        }
      } catch (error) {
        console.error(error);
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
      showConfirmEmail,
      router,
    ],
  );

  return (
    <>
      <If condition={showVerifyEmailAlert}>
        <SuccessAlert />
      </If>

      <If condition={!showVerifyEmailAlert}>
        <AuthErrorAlert error={signUpMutation.error} />

        <PasswordSignUpForm
          onSubmit={onSignupRequested}
          loading={loading}
          defaultValues={defaultValues}
          displayTermsCheckbox={displayTermsCheckbox}
          className={className}
        />
      </If>
    </>
  );
}

function SuccessAlert() {
  return (
    <Alert variant={'success'}>
      <CheckCircledIcon className={'w-4'} />

      <AlertTitle>
        <Trans i18nKey={'auth:emailConfirmationAlertHeading'} />
      </AlertTitle>

      <AlertDescription data-test={'email-confirmation-alert'}>
        <Trans i18nKey={'auth:emailConfirmationAlertBody'} />
      </AlertDescription>
    </Alert>
  );
}
