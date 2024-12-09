'use client';

import Link from 'next/link';



import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
// import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';
import { PasswordSignInSchema } from '../schemas/password-sign-in.schema';
import { ThemedButton } from '../../../accounts/src/components/ui/button-themed-with-settings';


export function PasswordSignInForm({
  onSubmit,
  themeColor,
  loading,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  themeColor: string | undefined;
  loading: boolean;
}) {
  const form = useForm<z.infer<typeof PasswordSignInSchema>>({
    resolver: zodResolver(PasswordSignInSchema),
    defaultValues: {
      email: '',
      password: '',
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
          name={'email'}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="pt-2 flex justify-center items-start text-2xl font-semibold " >
                <Trans i18nKey={'common:plsDetailInputs'} />  
              </FormLabel>

              <FormLabel className="flex justify-center items-start font-normal " >
              <Trans i18nKey={'common:continueToYourAccount'} />
              </FormLabel>

              <div className=" text-left text-sm" style={{ marginTop: '30px' }}>
                <Trans i18nKey={'common:emailLabel'} />
              </div>

              <FormControl>
                <Input
                  data-test={'email-input'}
                  required
                  type="email"
                  className="focus-visible:ring-brand"
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
              <div className="text-left text-sm" >
                <Trans i18nKey={'common:password'} />
              </div>

              <FormControl>
                <Input
                  required
                  data-test={'password-input'}
                  type="password"
                  placeholder={''}
                  {...field}
                  className="text-black focus-visible:ring-brand"
                  
                />
              </FormControl>

              <FormMessage />

              <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="text-black form-checkbox"
                    
                  />
                  <label htmlFor="rememberMe" className="text-xs" >
                    <Trans i18nKey={'auth:rememberMe'} />
                  </label>
                </div>

                <Button
                  asChild
                  type={'button'}
                  size={'sm'}
                  variant={'link'}
                  className={`font-inter flex items-center space-y-3 text-xs font-semibold leading-[20px] tracking-normal ${themeColor}`}
                  
                >
                  <Link href={'/auth/password-reset'}>
                    <Trans i18nKey={'auth:passwordForgottenQuestion'} />
                  </Link>
                </Button>
              </div>
            </FormItem>
          )}
        />

        <ThemedButton
          data-test="auth-submit-button"
          className="w-full"
          type="submit"
          disabled={loading}
          themeColor={themeColor}
        >
          <If
            condition={loading}
            fallback={
              <>
                <Trans i18nKey={'auth:signInWithEmail'} />

                <ArrowRight
                  className={
                    'zoom-in animate-in slide-in-from-left-2 fill-mode-both h-4 delay-500 duration-500'
                  }
                />
              </>
            }
          >
            <Trans i18nKey={'auth:signingIn'} />
          </If>
        </ThemedButton>
      </form>
    </Form>
  );
}