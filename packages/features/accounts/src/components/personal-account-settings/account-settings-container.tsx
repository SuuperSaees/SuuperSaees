'use client';

import { useEffect, useState } from 'react';



import Link from 'next/link';



import { useSupabase } from '@kit/supabase/hooks/use-supabase';
// import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
// import { If } from '@kit/ui/if';
// import { LanguageSelector } from '@kit/ui/language-selector';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Trans } from '@kit/ui/trans';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Button } from '@kit/ui/button';
import type { Account } from '../../../../../../apps/web/lib/account.types';
import type { Database } from '../../../../../../apps/web/lib/database.types';
import { getUserRole } from '../../../../team-accounts/src/server/actions/members/get/get-member-account';
import { ThemedButton } from '../ui/button-themed-with-settings';
import { UpdateEmailFormContainer } from './email/update-email-form-container';
import { UpdatePasswordFormContainer } from './password/update-password-container';
import UpdateAccountColorBrand from './update-account-color-brand';
import { UpdateAccountDetailsFormContainer } from './update-account-details-form-container';
import { UpdateAccountImageContainer } from './update-account-image-container';
// import UpdateAccountOrganizationLogo from './update-account-organization-logo';
// import { UpdateAccountOrganizationName } from './update-account-organization-name';
import UpdateAccountOrganizationSidebar from './update-account-organization-sidebar';
import BillingContainerConfig  from './billing/billing-container';
import RegisterAccountContainer from '../../../../../../apps/web/app/stripe/components/register-stripe-account-container';
import { BillingContextProvider } from '../../../../../../apps/web/app/home/[account]/contexts/billing-context'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
  const [user, setUser] = useState<Account.Type | null>();
  const [role, setRole] =
    useState<Database['public']['Tables']['roles']['Row']['name']>();
  const client = useSupabase();

  const fetchUserAccount = async () => {
    const { data: user, error: userAccountError } = await client
      .from('accounts')
      .select('*')
      .eq('id', props.userId)
      .single();

    if (userAccountError) console.error(userAccountError.message);
    return user;
  };

  const [accountStripe, setAccountStripe] = useState<AccountStripe>({
    id: '',
    charges_enabled: false,
  });
  // const supportsLanguageSelection = useSupportMultiLanguage();
  useEffect(() => {
    let user: Account.Type | null;
    void fetchUserAccount()
      .then((data) => {
        setUser(data);
        user = data;
      })
      .then(() => {
        const fetchAccountStripe = async () => {
          const stripeId = user?.stripe_id as string;
          if (stripeId) {
            try {
              const response = await fetch(
                `${baseUrl}/api/stripe/get-account?accountId=${encodeURIComponent(stripeId)}`,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );
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
      });
  }, []);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const role = await getUserRole();
        setRole(role);
      } catch (error) {
        console.error(error);
      }
    };

    void fetchUserRole();
  });
  //////////////////////////////////////
  if (!user || !role) {
    return <LoadingOverlay fullPage />;
  }
  return (
    <BillingContextProvider>
    <div className="">
      <Tabs defaultValue='account'>
        <TabsList>
          <TabsTrigger value='account'>Mi perfil</TabsTrigger>
          <TabsTrigger value='billing'>Facturación</TabsTrigger>
        </TabsList>
        <TabsContent value='account'>
          <div className='"flex w-full flex-wrap gap-6 pb-32 lg:flex-nowrap'>
          <div className="flex w-full flex-col space-y-6">
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
        {/* <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:brandName'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:brandNameDescription'} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UpdateAccountOrganizationName />
          </CardContent>
        </Card> */}
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
        {/* Brand color section */}
        {role === 'agency_owner' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans i18nKey={'account:brandColor'} />
                </CardTitle>
                <CardDescription>
                  <Trans i18nKey={'account:brandColorDescription'} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateAccountColorBrand />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Trans i18nKey={'account:brandSidebar'} />
                </CardTitle>
                <CardDescription>
                  <Trans i18nKey={'account:brandSidebarDescription'} />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UpdateAccountOrganizationSidebar />
              </CardContent>
            </Card>
            {/* <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:brandLogo'} />
            </CardTitle>
            <CardDescription>
              <Trans i18nKey={'account:brandLogoDescription'} />
            </CardDescription>
          </CardHeader>
          {/* <CardContent>
            <UpdateAccountOrganizationLogo
              organizationId={user?.organization_id ?? ''}
            />
          </CardContent> 
        </Card> */}
          </>
        )}

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
                <Trans
                  i18nKey={'account:connectToStripeDescription'}
                  key={'s'}
                />
              ) : accountStripe.charges_enabled ? (
                <Trans i18nKey={'account:stripeConnectedDescription'} />
              ) : (
                <Trans
                  i18nKey={'account:continueWithOnboardingStripeDescription'}
                />
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(!accountStripe?.id || !accountStripe.charges_enabled) && (
              // <ThemedButton className="bg-brand">
              //   <Link href={'/stripe'}>
              //     {accountStripe?.id ? 'Continuar' : 'Conectar'}
              //   </Link>
              // </ThemedButton>
              <RegisterAccountContainer />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex mt-6 w-full max-w-full flex-col space-y-6 lg:max-w-[350px]">
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
        </TabsContent>
        <TabsContent value='billing'>
          {/* <div className="flex w-full flex-col space-y-6">
            <Button>
              <Link href="/select-plan">
                Upgrade your plan
              </Link>
            </Button>
              
            </div> */}
            <BillingContainerConfig />
        </TabsContent>
          

      </Tabs>
    </div>
    </BillingContextProvider>
  );
}

// function useSupportMultiLanguage() {
//   const { i18n } = useTranslation();
//   const langs = (i18n?.options?.supportedLngs as string[]) ?? [];

//   const supportedLangs = langs.filter((lang) => lang !== 'cimode');

//   return supportedLangs.length > 1;
// }