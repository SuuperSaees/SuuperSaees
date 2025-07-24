'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

import { PasswordSignUpSchema } from '../schemas/password-sign-up.schema';
import { useAuthDetails } from '../sign-in';
import { TermsAndConditionsFormField } from './terms-and-conditions-form-field';

import { getTextColorBasedOnBackground } from '../../../../../apps/web/app/utils/generate-colors';
import { EyeOff, Eye } from 'lucide-react';
import { useState } from 'react';
import { Spinner } from '@kit/ui/spinner';
import { Input } from '@kit/ui/input';


export function PasswordSignUpForm({
  defaultValues,
  displayTermsCheckbox,
  onSubmit,
  loading,
  className,
  inviteToken,
}: {
  defaultValues?: {
    email: string;
  };

  displayTermsCheckbox?: boolean;

  onSubmit: (params: {
    email: string;
    password: string;
    organizationName: string;
    repeatPassword: string;
  }) => unknown;
  loading: boolean;
  className?: string;
  inviteToken?: string;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    resolver: zodResolver(PasswordSignUpSchema),
    defaultValues: {
      email: defaultValues?.email ?? '',
      password: '',
      organizationName: '',
      invite_token: inviteToken ?? '',
      termsAccepted: false,
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
       <div className='flex flex-col gap-2.5 '>
       {
        !inviteToken && (
          <FormField
            control={form.control}
            name={'organizationName'}
            render={({ field }) => (
              <FormItem className="text-start w-full text-black">
                <FormLabel>
                  <Trans i18nKey={'common:organizationNamelabel'} />
                </FormLabel>

                <FormControl>
                  <Input
                    className='w-full'
                    data-test={'email-input'}
                    required
                    type='text'
                    placeholder={t('organizationNamePlaceholder')}
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )
       }




        <FormField
          control={form.control}
          name={'email'}
          render={({ field }) => (
            <FormItem className="text-start w-full text-black">
              <FormLabel>
                <Trans i18nKey={'common:emailAddress'} />
              </FormLabel>

              <FormControl>
                <Input
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
            <FormItem className="text-start text-black">
              <FormLabel>
                <Trans i18nKey={'common:password'} />
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <Input
                    required
                    data-test={'password-input'}
                    type={showPassword ? "text" : "password"}
                    placeholder={''}
                    {...field}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      field.onChange(e);
                      form.setValue('repeatPassword', e.target.value);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <Eye className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <If condition={displayTermsCheckbox}>
          <TermsAndConditionsFormField />
        </If>
        <TermsAndConditionsFormField name='termsAccepted'/>

        <Button 
          type='submit' 
          disabled={loading}
          data-test={'auth-submit-button'}
          className='flex w-56 h-14 px-8 py-4 justify-center items-center flex-shrink-0 rounded-full mt-8'
          style={{
            backgroundColor: authDetails?.theme_color ?? '#1a38d7',
            color: getTextColorBasedOnBackground(authDetails?.theme_color ? authDetails.theme_color : '#000000'),
          }}
        >
          {loading ? (
            <Spinner className="h-5 w-5 animate-spin" />
          ) : (
            <div className='text-white text-center text-lg font-semibold tracking-[-0.18px]'>
              {inviteToken ? <Trans i18nKey={'auth:createAccount'}/> : <Trans i18nKey={'auth:createOrganization'}/>}
            </div>
          )}
        </Button>
       </div>
      </form>
    </Form>
  );
}
