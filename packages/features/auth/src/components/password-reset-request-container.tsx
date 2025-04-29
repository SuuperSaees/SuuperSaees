'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { useRequestResetPassword } from '@kit/supabase/hooks/use-request-reset-password';
// import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/ui/utils';

import { ThemedButton } from '../../../accounts/src/components/ui/button-themed-with-settings';
import { AuthErrorAlert } from './auth-error-alert';
import { AuthSuccessAlert } from './auth-success-alert';
import { If } from '@kit/ui/if';
import { useState } from 'react';

const PasswordResetSchema = z.object({
  email: z.string().email(),
});

export function PasswordResetRequestContainer(params: {
  redirectPath: string;
  themeColor: string | undefined;
  backgroundColor: string | undefined;
  className?: string;
}) {
  const { t } = useTranslation('auth');
  const resetPasswordMutation = useRequestResetPassword();
  const [error, setError] = useState(false);
  const success = resetPasswordMutation.data;
  
  const form = useForm<z.infer<typeof PasswordResetSchema>>({
    resolver: zodResolver(PasswordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(({ email }) => {
          return resetPasswordMutation
            .mutateAsync({
              email,
              redirectTo: new URL(params.redirectPath, window.location.origin)
                .href,
            })
            .then(() => {
              setError(false);
            })
            .catch(() => {
              console.error('Error requesting password reset');
              setError(true);
            });
        })}
        className={cn(
          'flex w-full flex-col gap-6 text-gray-900',
          params.className,
        )}
      >
        <span className="text-3xl font-bold text-black">
          {t('forgotPassword.title')}
        </span>

        <span>{t('forgotPassword.description')}</span>
        <If condition={success}>
          <AuthSuccessAlert
            title={t('forgotPassword.success.title')}
            description={t('forgotPassword.success.description')}
          />
        </If>

        <If condition={error}>
          <AuthErrorAlert
            title={t('forgotPassword.error.title')}
            description={t('forgotPassword.error.description')}
            visible={!error}
            onClose={() => setError(false)}
          />
        </If>
        {!success && !error && (
          <>
            <FormField
              name={'email'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="sr-only">
                    {t('forgotPassword.form.email.label')}
                  </FormLabel>

                  <FormControl>
                    <Input
                      required
                      type="email"
                      placeholder={t('forgotPassword.form.email.placeholder')}
                      {...field}
                      className="focus-visible:ring-brand placeholder:text-inherit py-3 h-fit"
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <ThemedButton
              disabled={resetPasswordMutation.isPending}
              themeColor={params.themeColor}
              className="w-full transition-all duration-300 hover:-translate-y-0.5"
            >
              {resetPasswordMutation.isPending && (
                <Spinner className="h-4 w-4" />
              )}
              {t('forgotPassword.form.submit')}
            </ThemedButton>
          </>
        )}

        {/* Or sign-in */}
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className="flex w-full items-center justify-center gap-8">
            <div className="h-[1px] w-full bg-gray-200"></div>
            <span className="text-gray-500">
              {t('forgotPassword.or.title')}
            </span>
            <div className="h-[1px] w-full bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('forgotPassword.or.question')}</span>
            <a href={'/auth/sign-in'} className="underline">
              {t('forgotPassword.or.link')}
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
