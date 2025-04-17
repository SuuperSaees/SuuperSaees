'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { User } from '@supabase/supabase-js';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useUpdateUser } from '@kit/supabase/hooks/use-update-user-mutation';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';
import { PasswordUpdateSchema } from '../../../schema/update-password.schema';
import { ThemedButton } from '../../ui/button-themed-with-settings';
import { ThemedInput } from '../../ui/input-themed-with-settings';


export const UpdatePasswordForm = ({
  user,
  callbackPath,
}: {
  user: User;
  callbackPath: string;
}) => {
  const { t } = useTranslation('account');
  const updateUserMutation = useUpdateUser();
  const [needsReauthentication, setNeedsReauthentication] = useState(false);
  const [passwordUpdated, setPasswordUpdated] = useState(false);


  const updatePasswordFromCredential = async (password: string) => {
    const redirectTo = [window.location.origin, callbackPath].join('');

    try {
      await updateUserMutation.mutateAsync({ password, redirectTo });
      toast.success(t(`updatePasswordSuccess`));
      setPasswordUpdated(true);
    } catch (error) {
      if (
        typeof error === 'string' &&
        error?.includes('Password update requires reauthentication')
      ) {
        setNeedsReauthentication(true);
      } else {
        toast.error(t(`updatePasswordError`));
        console.error(error);
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

  if (passwordUpdated) {
    return (
      <Link href="/home">
        <ThemedButton
        className='bg-brand'

        >
          {t('continue')}
        </ThemedButton>
      </Link>
    );
  }

  return (
    <Form {...form}>
      <form
        data-test={'account-password-form'}
        onSubmit={form.handleSubmit(updatePasswordCallback)}
        className='w-full'
      >
        <div className={'flex flex-col w-full gap-4'}>
          <If condition={updateUserMutation.data}>
            <SuccessAlert />
          </If>

          <If condition={needsReauthentication}>
            <NeedsReauthenticationAlert />
          </If>

          <FormField
            name={'newPassword'}
            render={({ field }) => {
              return (
                <FormItem>

                  <FormControl>
                    <ThemedInput
                      data-test={'account-password-form-password-input'}
                      required
                      type={'password'}
                      placeholder={t('newPassword')}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            name={'repeatPassword'}
            render={({ field }) => {
              return (
                <FormItem>

                  <FormControl>
                    <ThemedInput
                      data-test={'account-password-form-repeat-password-input'}
                      required
                      type={'password'}
                      placeholder={t('repeatPassword')}
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div>
            <ThemedButton
              disabled={updateUserMutation.isPending}
              className='w-64'
            >
              {t('updatePasswordSubmitLabel')}
            </ThemedButton>
          </div>
        </div>
      </form>
    </Form>
  );
};

function SuccessAlert() {
  return (
    <Alert variant={'success'}>
      <Check className={'h-4'} />

      <AlertTitle>
        <Trans i18nKey={'account:updatePasswordSuccess'} />
      </AlertTitle>

      <AlertDescription>
        <Trans i18nKey={'account:updatePasswordSuccessMessage'} />
      </AlertDescription>
    </Alert>
  );
}

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