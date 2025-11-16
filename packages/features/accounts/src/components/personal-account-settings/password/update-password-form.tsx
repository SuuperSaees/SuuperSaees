'use client';

import { useState } from 'react';

import type { User } from '@supabase/supabase-js';

import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Spinner } from '@kit/ui/spinner';
import { Trans } from '@kit/ui/trans';

import { AuthErrorAlert } from '../../../../../auth/src/components/auth-error-alert';
import { AuthSuccessAlert } from '../../../../../auth/src/components/auth-success-alert';
import { PasswordUpdateSchema } from '../../../schema/update-password.schema';
import { ThemedButton } from '../../ui/button-themed-with-settings';
import { ThemedInput } from '../../ui/input-themed-with-settings';

// Password input field component with visibility toggle
const PasswordField = ({ 
  field, 
  placeholder, 
  dataTest 
}: { 
  field: Record<string, unknown>, 
  placeholder: string, 
  dataTest: string 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <FormControl>
      <div className="relative">
        <ThemedInput
          data-test={dataTest}
          required
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          className="focus-visible:ring-brand placeholder:text-inherit pr-10 h-fit py-3"
          {...field}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onClick={() => setShowPassword(!showPassword)}
          tabIndex={-1}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </FormControl>
  );
};

export const UpdatePasswordForm = ({
  user,
  callbackPath,
  className,
}: {
  user: User;
  callbackPath: string;
  className?: string;
}) => {
  const { t } = useTranslation('account');
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [error, setError] = useState(false);
  
  const updatePasswordFromCredential = async (password: string) => {
    const redirectTo = [window.location.origin, callbackPath].join('');

    try {
      await updateUserMutation.mutateAsync({ password, redirectTo });
      setPasswordUpdated(true);
      setError(false);
    } catch (error) {
      if (
        typeof error === 'string' &&
        error?.includes('Password update requires reauthentication')
      ) {
        setNeedsReauthentication(true);
      } else {
        setError(true);
      }
    }
  };

  const updatePasswordCallback = async ({
    newPassword,
  }: {
    newPassword: string;
  }) => {
    const email = user.email;

    if (!email) {
      return Promise.reject(t(`cannotUpdatePassword`));
    }

    await updatePasswordFromCredential(newPassword);
  };

  const form = useForm({
    resolver: zodResolver(
      PasswordUpdateSchema.withTranslation(t('passwordNotMatching')),
    ),
    defaultValues: {
      newPassword: '',
      repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        data-test={'account-password-form'}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
        className="flex w-full flex-col items-center gap-6 text-center text-gray-900"
      >

        <If condition={passwordUpdated}>
          <AuthSuccessAlert
            title={t('updatePassword.success.title')}
            description={t('updatePassword.success.description')}
            visible={passwordUpdated}
            onClose={() => setPasswordUpdated(false)}
          />
        </If>

        <If condition={needsReauthentication}>
          <NeedsReauthenticationAlert />
        </If>

        <If condition={error}>
          <AuthErrorAlert
            title={t('updatePassword.error.title')}
            description={t('updatePassword.error.description')}
            visible={error}
            onClose={() => setError(false)}
          />
        </If>
        {!passwordUpdated && !needsReauthentication && !error && (
          <>
            <FormField
              name={'newPassword'}
              render={({ field }) => {
                return (
                  <FormItem className="w-full">
                    <PasswordField 
                      field={field} 
                      placeholder={t('updatePassword.form.newPassword.placeholder')}
                      dataTest={'account-password-form-password-input'}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <FormField
              name={'repeatPassword'}
              render={({ field }) => {
                return (
                  <FormItem className="w-full">
                    <PasswordField 
                      field={field} 
                      placeholder={t('updatePassword.form.repeatPassword.placeholder')}
                      dataTest={'account-password-form-repeat-password-input'}
                    />
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className='flex flex-col w-full'>
            <ThemedButton
              disabled={updateUserMutation.isPending}
              className={`w-64 self-start transition-all duration-300 hover:-translate-y-0.5 ${className}`} 
            >
              {updateUserMutation.isPending && <Spinner className="h-4 w-4" />}
              {t('updatePasswordSubmitLabel')}
            </ThemedButton>
            </div>
          </>
        )}


      </form>
    </Form>
  );
};

function NeedsReauthenticationAlert() {
  return (
    <Alert variant={'warning'}>
      <ExclamationTriangleIcon className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:needsReauthentication'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:needsReauthenticationDescription'} />
      </AlertDescription>
    </Alert>
  );
}
