'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { LanguageSelector } from '@kit/ui/language-selector';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';
import type { Account } from '../../../../../../apps/web/lib/account.types';
import type { Database } from '../../../../../../apps/web/lib/database.types';
import { getUserRole } from '../../../../team-accounts/src/server/actions/members/get/get-member-account';
import { ThemedButton } from '../ui/button-themed-with-settings';
import { ThemedTabTrigger } from '../ui/tab-themed-with-settings';
import BillingContainerConfig from './billing/billing-container';
import { UpdateEmailFormContainer } from './email/update-email-form-container';
import { UpdatePasswordFormContainer } from './password/update-password-container';
import UpdateAccountColorBrand from './update-account-color-brand';
import { UpdateAccountDetailsFormContainer } from './update-account-details-form-container';
import { UpdateAccountImageContainer } from './update-account-image-container';
import UpdateAccountOrganizationLogo from './update-account-organization-logo';
import UpdateAccountOrganizationFavicon from './update-account-organization-favicon';
import { UpdateAccountOrganizationName } from './update-account-organization-name';
import UpdateAccountOrganizationSidebar from './update-account-organization-sidebar';
import { useBilling } from '../../../../../../apps/web/app/home/[account]/hooks/use-billing';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDomainByUserId } from '../../../../../multitenancy/utils/get/get-domain';
import { useOrganizationSettings } from '../../context/organization-settings-context'


// const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get('tab');
  const checkoutResult = searchParams.get('checkout');
  const [user, setUser] = useState<Account.Type | null>();
  const {accountBillingTab, setAccountBillingTab, upgradeSubscription } = useBilling();
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
              const baseUrl = await getDomainByUserId(user?.id ?? '', true);
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
        if (checkoutResult === 'success') {
          await upgradeSubscription();
          router.push('/home/settings')
        }
        setRole(role);
      } catch (error) {
        console.error(error);
      }
    };
    if (tab){
      setAccountBillingTab(tab);
    }
    void fetchUserRole();
  }, [tab, checkoutResult]);
  
  const { updateOrganizationSetting } =
  useOrganizationSettings();

  const handleChangeLanguage = (locale: string) => {
    updateOrganizationSetting.mutate({
      key: 'language',
      value: locale,
    });
  }
  //////////////////////////////////////
  if (!user || !role) {
    return <LoadingOverlay fullPage />;
  }
  return (
    <div>
      <Tabs defaultValue={"account"} value={accountBillingTab} onValueChange={(value: string) => setAccountBillingTab(value)}>
        {role !== 'client_member' && role !== 'client_owner' && (
          <TabsList className='gap-2 bg-transparent'>
            <ThemedTabTrigger
              value="account"
              option="account"
              activeTab={accountBillingTab}
            >
              <Trans i18nKey={'account:profile'} />
            </ThemedTabTrigger>
            <ThemedTabTrigger
              value="billing"
              option="billing"
              activeTab={accountBillingTab}
            >
              <Trans i18nKey={'account:billing'} />
            </ThemedTabTrigger>
          </TabsList>
        )}
        <TabsContent value="account">
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
                    className='h-20 w-20'
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
                  <LanguageSelector onChange={handleChangeLanguage} />
                </CardContent>
              </Card>

              {/* Brand color section */}
              {role === 'agency_owner' && (
                <>
                  <Card>
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
                  </Card>
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
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Trans i18nKey={'account:brandLogo'} />
                      </CardTitle>
                      <CardDescription>
                        <Trans i18nKey={'account:brandLogoDescription'} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UpdateAccountOrganizationLogo
                        organizationId={user?.organization_id ?? ''}
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <Trans i18nKey={'account:brandFavicon'} />
                      </CardTitle>
                      <CardDescription>
                        <Trans i18nKey={'account:brandFaviconDescription'} />
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <UpdateAccountOrganizationFavicon />
                    </CardContent>
                  </Card>
                </>
              )}

              {role !== 'client_member' && role !== 'client_owner' && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {!accountStripe?.id ? (
                        <Trans i18nKey={'account:connectToStripe'} />
                      ) : accountStripe.charges_enabled ? (
                        <Trans i18nKey={'account:stripeConnected'} />
                      ) : (
                        <Trans
                          i18nKey={'account:continueWithOnboardingStripe'}
                        />
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
                          i18nKey={
                            'account:continueWithOnboardingStripeDescription'
                          }
                        />
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(!accountStripe?.id || !accountStripe.charges_enabled) && (
                      <ThemedButton className="bg-brand">
                        <Link href={'/stripe'}>
                          {accountStripe?.id ? 'Continuar' : 'Conectar'}
                        </Link>
                      </ThemedButton>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="mt-6 flex w-full max-w-full flex-col space-y-6 lg:max-w-[350px]">
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
                  <UpdateEmailFormContainer
                    callbackPath={props.paths.callback}
                  />
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
                  <UpdatePasswordFormContainer
                    callbackPath={props.paths.callback}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          {/* <div className="flex w-full flex-col space-y-6">
            <Button>
              <Link href="/select-plan">
                Upgrade your plan
              </Link>
            </Button>
              
            </div> */}
          <BillingContainerConfig tab={tab ?? ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// function useSupportMultiLanguage() {
//   const { i18n } = useTranslation();
//   const langs = (i18n?.options?.supportedLngs as string[]) ?? [];
//   const supportedLangs = langs.filter((lang) => lang !== 'cimode');

//   return supportedLangs.length > 1;
// }