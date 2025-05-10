'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useState } from "react";
import { createIngress } from '~/multitenancy/aws-cluster-ingress/src/actions/create';
import { updateTokenData } from "~/team-accounts/src/server/actions/tokens/update/update-token";
import { updateAccountData } from "~/team-accounts/src/server/actions/accounts/update/update-account";
import { getSession } from "~/server/actions/accounts/accounts.action";
import { createSubscription } from '~/team-accounts/src/server/actions/subscriptions/create/create-subscription';
import { addUserToAirtable } from "~/team-accounts/src/server/utils/airtable";
import { useSupabase } from "@kit/supabase/hooks/use-supabase";
import { Spinner } from "@kit/ui/spinner";

export function UserDataForm(
  {userId, tokenId, accountData, userRole}: {userId: string, tokenId: string, accountData: {name: string, phone_number: string, subdomain: string} | null, userRole: string }
) {
  const {t} = useTranslation('auth');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const client = useSupabase();
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  const formSchema = z.object({
    portalUrl: userRole === 'agency_owner' 
      ? z.string().min(2, {message: t('userData.formErrors.portalUrl')}).max(50, {message: t('userData.formErrors.portalUrl')})
      : z.string().min(2, {message: t('userData.formErrors.portalUrl')}).max(50, {message: t('userData.formErrors.portalUrl')}).optional(),
    userFullName: z.string().min(2, {message: t('userData.formErrors.fullName')}).max(50, {message: t('userData.formErrors.fullName')}),
    userphoneNumber: z.string().min(10, {message: t('userData.formErrors.phoneNumber')}).max(50, {message: t('userData.formErrors.phoneNumber')}).regex(/^\d+$/, {message: t('userData.formErrors.phoneNumber')}),
})
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portalUrl: accountData?.subdomain?.replace('.suuper.co', ''), 
      userFullName: accountData?.name,
      userphoneNumber: accountData?.phone_number,
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    setError(null);
    try {
      await updateTokenData(tokenId, {
        expires_at: new Date().toISOString(),
      });
      const userData = await updateAccountData(userId, {
        name: data.userFullName,
        phone_number: data.userphoneNumber,
        user_id: userId,
      });

      const organizationData = (await getSession())?.organization;

      if (userData) {
        try {
          if (!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
            setError(t('userData.errors.configurationAirtable'));
            return;
          }

          
          if (BASE_URL === 'https://app.suuper.co/') {
            await addUserToAirtable({
              name: userData?.userData?.name ?? '',
              email: userData?.accountData?.email ?? '',
              organizationName: organizationData?.name ?? '',
              phoneNumber: userData?.userData?.phone_number ?? '',
            });
          } 
          
          
        } catch (error) {
          console.error(`❌ ${t('userData.errors.configurationAirtable')}:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            context: 'Register user',
            email: userData?.accountData?.email ?? '',
          });
          setError(t('userData.errors.configurationAirtable'));
          return;
        }
      }
        
        try {
          const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
          const cleanedDomain = data.portalUrl?.replace(/[^a-zA-Z0-9]/g, '') ?? '';
          // const subdomain = await createIngress({ domain: cleanedDomain, isCustom: false, userId });
          const subdomain = await createIngress({ domain: cleanedDomain, isCustom: false, userId });

          await client.rpc('update_user_credentials', {
            p_domain: subdomain.domain,
            p_email: userData?.accountData?.email ?? '',
            p_password:  '',
          });
          
          const subscriptionResult = await createSubscription();
          if ('error' in subscriptionResult) {
            setError(t('userData.errors.subscriptionFailed'));
            setLoading(false);
            return;
          }

          if (IS_PROD) {
            router.push(`https://${subdomain.domain}/orders`);
          } else {
            if (BASE_URL === 'https://app.suuper.co/') {
              router.push(`https://${subdomain.domain}/orders`);
            } else {
              router.push(`${BASE_URL}/orders`);
            }
          }
          setLoading(false);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setError(`${t('userData.errors.setupFailed')}: ${errorMessage}`);
          setLoading(false);
          return;
        }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ ${t('userData.errors.userCreationError')}:`, {
        message: errorMessage,
        context: 'User creation',
        userId,
      });
      setError(`${t('userData.errors.userCreationError')}: ${errorMessage}`);
      setLoading(false);
    } 
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
        {error && (
          <div className="p-4 text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        {userRole === 'agency_owner' && (
          <FormField
          control={form.control}
          name="portalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  {t('userData.portalUrl')}
                  <span className="text-black text-sm font-extralight leading-[23.04px] tracking-[-0.144px]">{t('userData.portalUrlHint')}</span>
                </div>
              </FormLabel>
              <FormControl>
                <div className="flex items-center">
                  <Input 
                    className=" border-r-0" 
                    placeholder={t('userData.portalUrlPlaceholder')} 
                    {...field} 
                  />
                  <Input 
                    disabled
                    value=".suuper.co"
                    className="rounded-l-none border-l-0 bg-gray-50 w-[105px] cursor-default"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-start"/>
            </FormItem>
          )}
        />
        )}
          <FormField
            control={form.control}
            name="userFullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">{t('userData.fullName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('userData.fullNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage className="text-start"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userphoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">{t('userData.phoneNumber')}</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={'co'}
                    value={field.value}
                    onChange={(phone) => field.onChange(phone)}
                    inputClass="!w-full p-2 border rounded-md"
                    containerClass="!w-full"
                    // buttonClass="!border-r-0"
                    buttonClass="!border-r-0 !border !border-[#ECEBEC] hover:!border-[#ECEBEC] !rounded-l-md"
                    inputStyle={{
                      width: '100%',
                      height: '40px',
                      borderRadius: '7px',
                      borderColor: '#ECEBEC',
                      boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                    }}
                    placeholder={t('userData.phoneNumberPlaceholder')}
                  />
                </FormControl>
                <FormMessage className="text-start"/>
              </FormItem>
            )}
          />
          <Button 
            type='submit' 
            disabled={loading}
            data-test={'auth-submit-button'}
            className='flex w-full sm:w-56 h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-4 justify-center items-center flex-shrink-0 rounded-full mt-6 sm:mt-8 bg-brand'
          >
            {loading ? <Spinner className="w-4 h-4" />: (
              <div className='text-white text-center text-base sm:text-lg font-semibold tracking-[-0.18px]'>
                {t('userData.signUpUserDataButton')}
              </div>
            )}
          </Button>
        </form>
      </Form>
    </>
  );
}