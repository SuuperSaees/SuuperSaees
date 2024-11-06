'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { ThemedInput } from '../../../accounts/src/components/ui/input-themed-with-settings';
import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { useAuthDetails } from '../sign-in';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';
import { getTextColorBasedOnBackground } from '../../../team-accounts/src/server/utils/generate-colors';

export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
  className
}: {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    email: string;
    password: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
  className?: string;
}) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: defaultValues?.email ?? '',
      password: '',
      repeatPassword: '',
    },
  });

  let host = 'localhost:3000';

  if (typeof window !== 'undefined') {
    host = window.location.host;
  }

  const {authDetails} = useAuthDetails(host);
  
  return (
    <Form {...form}>
      <form
        className={'w-full space-y-2.5 ' + className}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem className="text-start w-full">
              <FormLabel>
                <Trans i18nKey={'common:emailAddress'} />
              </FormLabel>

              <FormControl>
                <ThemedInput
                  className='w-full'
                  data-test={'email-input'}
                  required
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'password'}
          render={({ field }) => (
            <FormItem className="text-start">
              <FormLabel>
                <Trans i18nKey={'common:password'} />
              </FormLabel>

              <FormControl>
                <ThemedInput
                  required
                  data-test={'password-input'}
                  type="password"
                  placeholder={''}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem className="text-start">
              <FormLabel>
                <Trans i18nKey={'auth:repeatPassword'} />
              </FormLabel>

              <FormControl>
                <ThemedInput
                  required
                  data-test={'repeat-password-input'}
                  type="password"
                  placeholder={''}
                  {...field}
                />
              </FormControl>

              <FormMessage />

              <FormDescription className={'pb-2 text-xs'}>
                <Trans i18nKey={'auth:repeatPasswordHint'} />
              </FormDescription>
            </FormItem>
          )}
        />

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>

        <Button
          data-test={'auth-submit-button'}
          className={'w-full'}
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: authDetails?.theme_color ?? '#1a38d7',
            color: getTextColorBasedOnBackground(authDetails?.theme_color ? authDetails.theme_color : '#ffffff'),
          }}
        >
          <If
            condition={loading}
            fallback={
              <>
                <Trans i18nKey={'auth:signUpWithEmail'} />

                <ArrowRight
                  className={
                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                  }
                />
              </>
            }
          >
            <Trans i18nKey={'auth:signingUp'} />
          </If>
        </Button>
      </form>
    </Form>
  );
}
