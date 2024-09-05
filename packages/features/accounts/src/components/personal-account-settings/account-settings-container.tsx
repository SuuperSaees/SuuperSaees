"use client";
import { useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
// import { If } from '@kit/ui/if';
// import { LanguageSelector } from '@kit/ui/language-selector';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';
import { UpdateEmailFormContainer } from './email/update-email-form-container';
import { UpdatePasswordFormContainer } from './password/update-password-container';
import { UpdateAccountDetailsFormContainer } from './update-account-details-form-container';
import { UpdateAccountImageContainer } from './update-account-image-container';
import { Button } from '@kit/ui/button';
import Link from 'next/link';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

type AccountStripe = {
  id: string;
  charges_enabled: boolean;
};

export function PersonalAccountSettingsContainer(
  
  props: React.PropsWithChildren<{
    userId: string;
    features: {
      enableAccountDeletion: boolean;
    };
    paths: {
      callback: string;
    };
  }>,
) {
  const [user, setUser] = useState()
  const client = useSupabase()

  const fetchUserAccount = async () => {
    const { data: user, error: userAccountError } = await client
      .from('accounts')
      .select('*')
      .eq('id', props.userId)
      .single();
   
    if (userAccountError) console.error(userAccountError.message);
    return user
  }

////////////////////////////////////////// Pasarlo a un custom hook
  const [accountStripe, setAccountStripe] = useState<AccountStripe>({
    id: "",
    charges_enabled: false,
  });
  // const supportsLanguageSelection = useSupportMultiLanguage();
  useEffect(() => {
    let user;
    void fetchUserAccount().then((data)=> {
      setUser(data)
      user= data
    }).then(()=> {
      const fetchAccountStripe = async () => {
        const stripeId = user?.stripe_id as string;
        if (stripeId) {
          try {
            const response = await fetch(`/api/stripe/get-account?accountId=${encodeURIComponent(stripeId)}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            if (!response.ok) {
              throw new Error('Failed to fetch account data from Stripe');
            }
            const data: AccountStripe = await response.json();
            setAccountStripe(data);
          } catch (error) {
            console.error('Error fetching account data:', error);
          }
        }
      };

      void fetchAccountStripe();
    })
  }, []);
//////////////////////////////////////
  if (!user) {
    return <LoadingOverlay fullPage />;
  }

  return (
    <div className="flex lg:flex-nowrap flex-wrap w-full  pb-32 gap-6">
      <div className="flex flex-col space-y-6 w-full">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:accountImage'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:accountImageDescription'} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateAccountImageContainer
              user={{
                pictureUrl: user.picture_url,
                id: user.id,
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:name'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:nameDescription'} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateAccountDetailsFormContainer user={user} />
          </CardContent>
        </Card>
        {/* SUPPORT LANGUAGE, PENDING */}
        {/* <If condition={supportsLanguageSelection}>
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans i18nKey={'account:language'} />
              </CardTitle>
              <CardDescription>
                <Trans i18nKey={'account:languageDescription'} key={'s'} />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSelector />
            </CardContent>
          </Card>
        </If> */}

        <Card>
          <CardHeader>
            <CardTitle>
              {!accountStripe?.id ? (
                <Trans i18nKey={'account:connectToStripe'} />
              ) : accountStripe.charges_enabled ? (
                <Trans i18nKey={'account:stripeConnected'} />
              ) : (
                <Trans i18nKey={'account:continueWithOnboardingStripe'} />
              )}
            </CardTitle>
            <CardDescription>
              {!accountStripe?.id ? (
                <Trans i18nKey={'account:connectToStripeDescription'} key={'s'} />
              ) : accountStripe.charges_enabled ? (
                <Trans i18nKey={'account:stripeConnectedDescription'} />
              ) : (
                <Trans i18nKey={'account:continueWithOnboardingStripeDescription'} />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!accountStripe?.id || !accountStripe.charges_enabled) && (
              <Button>
                <Link href={'/stripe'}>
                  {accountStripe?.id ? "Continuar" : "Conectar"}
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col space-y-6 max-w-full lg:max-w-[350px] w-full">
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:updateEmailCardTitle'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:updateEmailCardDescription'} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateEmailFormContainer callbackPath={props.paths.callback} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:updatePasswordCardTitle'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:updatePasswordCardDescription'} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdatePasswordFormContainer callbackPath={props.paths.callback} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// function useSupportMultiLanguage() {
//   const { i18n } = useTranslation();
//   const langs = (i18n?.options?.supportedLngs as string[]) ?? [];

//   const supportedLangs = langs.filter((lang) => lang !== 'cimode');

//   return supportedLangs.length > 1;
// }