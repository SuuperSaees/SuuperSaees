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
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';
import { Separator } from '@kit/ui/separator';

export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
}: {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    name: string;
    email: string;
    password: string;
    portalName: string;
    // repeatPassword: string;
  }) => unknown;
  loading: boolean;
}) {
  const { t } = useTranslation();

  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      name: '',
      email: defaultValues?.email ?? '',
      password: 'defaultPassword123',
      portalName: '',
      // repeatPassword: '',
    },
  });

  return (
    <Form {...form}>
      <form
        className={'w-full space-y-2.5'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name={'name'}
          render={({ field }) => (
            <FormItem  className='text-start'>
              <FormLabel>
                <Trans i18nKey={'common:nameInput'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  type="string"
                  placeholder={t('namePlaceholder')}
                  {...field}
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem  className='text-start'>
              <FormLabel>
                <Trans i18nKey={'common:emailAddress'} />
              </FormLabel>

              <FormControl>
                <Input
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
          name={'portalName'}
          render={({ field }) => (
            <FormItem  className='text-start'>
              <FormLabel>
                <Trans i18nKey={'common:namePortalInput'} />
              </FormLabel>

              <FormControl>
                <Input
                  required
                  type="string"
                  placeholder={t('namePortalPlaceholder')}
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
            <FormItem>
              {/* <FormLabel>
                <Trans i18nKey={'common:password'} />
              </FormLabel> */}

              <FormControl>
                <Input
                  className={'hidden'}
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

        {/* <FormField
          control={form.control}
          name={'repeatPassword'}
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <Trans i18nKey={'auth:repeatPassword'} />
              </FormLabel>

              <FormControl>
                <Input
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
        /> */}

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>



        <Button
          data-test={'auth-submit-button'}
          className={'w-full bg-brand-600 hover:bg-brand-700'}
          type="submit"
          disabled={loading}
        >
          <If
            condition={loading}
            fallback={
              <>
                <Trans i18nKey={'auth:signUpWithEmail'} />
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
