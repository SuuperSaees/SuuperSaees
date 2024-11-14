'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useState } from "react";
import { createIngress } from '~/multitenancy/aws-cluster-ingress/src/actions/create';
// import { createSubscription } from '~/team-accounts/src/server/actions/subscriptions/create/create-subscription';

const formSchema = z.object({
    portalUrl: z.string().min(2).max(50),
    userFullName: z.string().min(2).max(50),
    userphoneNumber: z.string().min(2).max(50).regex(/^\d+$/, "Solo se permiten números"),
})

export function UserDataForm(
  {userId, tokenId}: {userId: string, tokenId: string}
) {
  const {t} = useTranslation('auth');
  const router = useRouter();
  const supabase = useSupabase();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      portalUrl: "",
      userFullName: "",
      userphoneNumber: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      console.log(data);
      await supabase.from('tokens')
      .update({
          expires_at: new Date().toISOString(),
      })
      .eq('id_token_provider', tokenId);
      await supabase.from('accounts')
      .update({
          name: data.userFullName,
          phone_number: data.userphoneNumber,
      })
      .eq('id', userId);
      // const { userId: suscribtionId } = await createSubscription();
      const cleanedDomain = data.portalUrl.replace(/[^a-zA-Z0-9]/g, '');
      // const subdomain = await createIngress({ domain: cleanedDomain, isCustom: false, userId: suscribtionId });
      const subdomain = await createIngress({ domain: cleanedDomain, isCustom: false, userId });
      const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
      const BASE_URL = IS_PROD
        ? `https://${subdomain.domain}`
        : process.env.NEXT_PUBLIC_SITE_URL;
      router.push(`${BASE_URL}/orders`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
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
                  disabled
                  value="https://"
                  className="rounded-r-none border-r-0 bg-gray-50 w-[85px] cursor-default"
                />
                <Input 
                  className="rounded-none border-x-0" 
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
            <FormMessage />
          </FormItem>
        )}
      />
        <FormField
          control={form.control}
          name="userFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('userData.fullName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('userData.fullNamePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="userphoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('userData.phoneNumber')}</FormLabel>
              <FormControl>
                <PhoneInput
                  country={'co'}
                  value={field.value}
                  onChange={(phone) => field.onChange(phone)}
                  inputClass="!w-full p-2 border rounded-md"
                  containerClass="!w-full"
                  buttonClass="!border-r-0"
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
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <Button type="submit">Submit</Button> */}
        <Button 
          type='submit' 
          disabled={loading}
          data-test={'auth-submit-button'}
          className='flex w-full sm:w-56 h-12 sm:h-14 px-6 sm:px-8 py-3 sm:py-4 justify-center items-center flex-shrink-0 rounded-full mt-6 sm:mt-8 bg-brand'
        >
          <div className='text-white text-center text-base sm:text-lg font-semibold tracking-[-0.18px]'>
            {t('userData.signUpUserDataButton')}
          </div>
        </Button>
      </form>
    </Form>
  );
}