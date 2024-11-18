'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useTranslation } from 'react-i18next';
// import { If } from '@kit/ui/if';
import { LoadingOverlay } from '@kit/ui/loading-overlay';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { Trans } from '@kit/ui/trans';
import type { Account } from '../../../../../../apps/web/lib/account.types';
import type { Database } from '../../../../../../apps/web/lib/database.types';
import { getUserRole } from '../../../../team-accounts/src/server/actions/members/get/get-member-account';
import { ThemedTabTrigger } from '../ui/tab-themed-with-settings';
import BillingContainerConfig from './billing/billing-container';
import { useBilling } from '../../../../../../apps/web/app/home/[account]/hooks/use-billing';
import { useSearchParams, useRouter } from 'next/navigation';
import { getDomainByUserId } from '../../../../../multitenancy/utils/get/get-domain';
import { useOrganizationSettings } from '../../context/organization-settings-context'
import PlansContainer from '../../../../../../apps/web/app/select-plan/components/plans-container';
import { Separator } from '@kit/ui/separator';
import ProfileSettings from '../profile-settings';
import SiteSettings from '../site-settings';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { UserSettings } from '../../../../../../apps/web/lib/user-settings.types';
import { getAccountSettings } from '../../../../team-accounts/src/server/actions/accounts/get/get-account';


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
  const { t } = useTranslation('account');
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

  const {data: userSettings} = useQuery<UserSettings.Type>({
    queryKey: ['user-settings', props.userId],
    queryFn: async () => {
      const data = await getAccountSettings(props.userId);
      return data;
    },
    staleTime: 1000 * 60 * 5,
  }) as UseQueryResult<UserSettings.Type, unknown>;



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
              const { domain: baseUrl } = await getDomainByUserId(user?.id ?? '', true);
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
    <div className="w-full h-full">
      <Tabs defaultValue={"site"} value={accountBillingTab} onValueChange={(value: string) => setAccountBillingTab(value)}>
        {role !== 'client_member' && role !== 'client_owner' && (
          <div className="flex items-center justify-between pb-[24px]">
          <TabsList className='gap-2 bg-transparent '>
            <ThemedTabTrigger
              value="site"
              option="site"
              activeTab={accountBillingTab}
            >
              Portal
            </ThemedTabTrigger>
            <ThemedTabTrigger
              value="profile"
              option="profile"
              activeTab={accountBillingTab}
            >
              {t('profileTab')}
            </ThemedTabTrigger>

            <ThemedTabTrigger
              value="subscription"
              option="subscription"
              activeTab={accountBillingTab}
            >
              <Trans i18nKey={'account:subscription'} />
            </ThemedTabTrigger>
          </TabsList>
          </div>
        )}
        <Separator />
        <TabsContent value="site">
          <SiteSettings role = {role} handleChangeLanguage = {handleChangeLanguage} user={user}/>
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings user={user} userSettings = {userSettings} callback={props.paths.callback} handleChangeLanguage={handleChangeLanguage} />
        </TabsContent>
        <TabsContent value="subscription">
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