'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';
import { cn } from '@kit/ui/utils';

import { ThemedButton } from '../../../accounts/src/components/ui/button-themed-with-settings';
import { PasswordSignInSchema } from '../schemas/password-sign-in.schema';

export function PasswordSignInForm({
  onSubmit,
  themeColor,
  loading,
  className,
}: {
  onSubmit: (params: z.infer<typeof PasswordSignInSchema>) => unknown;
  themeColor: string | undefined;
  loading: boolean;
  className?: string;
}) {
  const { t } = useTranslation('auth');
  const [showPassword, setShowPassword] = useState(false);
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
        className={cn('flex w-full flex-col gap-5 text-gray-900', className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <span className="text-5xl font-bold text-black">
          {t('signIn.title')}
        </span>

        <span>{t('signIn.description')}</span>

        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  data-test={'email-input'}
                  required
                  type="email"
                  className="focus-visible:ring-brand h-fit py-3 placeholder:text-inherit"
                  placeholder={t('signIn.form.email.placeholder')}
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
              <FormControl>
                <div className="relative">
                  <Input
                    required
                    data-test={'password-input'}
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('signIn.form.password.placeholder')}
                    {...field}
                    className="focus-visible:ring-brand h-fit py-3 pr-10 placeholder:text-inherit"
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

              <FormMessage />
            </FormItem>
          )}
        />
        {/* Remember and forgot password */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="rememberMe" className="form-checkbox" />
            <label htmlFor="rememberMe" className="text-xs font-medium">
              {t('signIn.form.rememberMe')}
            </label>
          </div>

            <a href={'/auth/password-reset'} className="text-xs font-medium font-inter">
              {t('signIn.form.forgotPassword')}
            </a>
  
        </div>
        <ThemedButton
          data-test="auth-submit-button"
          className="h-fit w-full py-3 transition-all duration-300 hover:-translate-y-0.5"
          type="submit"
          disabled={loading}
          themeColor={themeColor}
        >
          <If
            condition={!loading}
            fallback={
              <>
                {t('signIn.label')}

                <Spinner className="h-4 w-4" />
              </>
            }
          >
            {t('signIn.label')}
          </If>
        </ThemedButton>
        
        {/* Or sign-up section */}
        <div className="flex flex-col items-center gap-3 text-sm">
          <div className="flex w-full items-center justify-center gap-8">
            <div className="h-[1px] w-full bg-gray-200"></div>
            <span className="text-gray-500">{t('signIn.or.title') || 'or'}</span>
            <div className="h-[1px] w-full bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('signIn.or.question') || "Don't have an account?"}</span>
            <a href={'/auth/sign-up'} className="underline">
              {t('signIn.or.link') || 'Sign up'}
            </a>
          </div>
        </div>
      </form>
    </Form>
  );
}
