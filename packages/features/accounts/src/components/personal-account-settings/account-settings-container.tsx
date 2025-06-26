'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { ThemedTabTrigger } from '../ui/tab-themed-with-settings';
import BillingContainerConfig from './billing/billing-container';
import { useBilling } from '../../../../../../apps/web/app/(main)/home/[account]/hooks/use-billing';
import { useSearchParams, useRouter } from 'next/navigation';
import { useOrganizationSettings } from '../../context/organization-settings-context'
import { Separator } from '@kit/ui/separator';
import ProfileSettings from '../profile-settings';
import SiteSettings from '../site-settings';
import InvoiceSettings from '../invoice-settings';
import PaymentSettings from '../payment-settings';
import { useQuery } from '@tanstack/react-query';
import { getAccountSettings } from '../../../../team-accounts/src/server/actions/accounts/get/get-account';
import { useUserWorkspace } from '../../hooks/use-user-workspace';


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
  const {accountBillingTab, setAccountBillingTab, upgradeSubscription } = useBilling();
  const { workspace, user } = useUserWorkspace();
  const role = workspace.role;


  const fetchSettings = async () => {
    const response = await getAccountSettings(props.userId);
    return response;
  }

  const { data: userSettings } = useQuery({
    queryKey: ['user-settings', props.userId], 
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (checkoutResult === 'success') {
          await upgradeSubscription();
          router.push('/home/settings')
        }
        if(role !== 'agency_owner'){
          setAccountBillingTab('profile');
        }
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

  return (
    <div>
      <Tabs defaultValue={"site"} value={accountBillingTab} onValueChange={(value: string) => setAccountBillingTab(value)}>
        {role !== 'client_member' && role !== 'client_owner' && (
          <div className="flex items-center justify-between pb-[24px]">
          <TabsList className='gap-2 bg-transparent '>
            {
              role == 'agency_owner' && (
                <ThemedTabTrigger
                value="site"
                option="site"
                activeTab={accountBillingTab}
              >
                Portal
                </ThemedTabTrigger>
              )
            }
            
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
              {t('subscriptionTab')}
            </ThemedTabTrigger>

            {role === 'agency_owner' && (
              <ThemedTabTrigger
                value="invoices"
                option="invoices"
                activeTab={accountBillingTab}
              >
                {t('invoicesTab')}
              </ThemedTabTrigger>
            )}

            {role === 'agency_owner' && (
              <ThemedTabTrigger
                value="payments"
                option="payments"
                activeTab={accountBillingTab}
              >
                {t('paymentsTab')}
              </ThemedTabTrigger>
            )}
          </TabsList>
          </div>
        )}
        <Separator />
        {
          role === 'agency_owner' && (
            <TabsContent value="site">
              <SiteSettings role = {role} handleChangeLanguage = {handleChangeLanguage} user={user}/>
            </TabsContent>
          )
        }
        
        <TabsContent value="profile">
          <ProfileSettings userId={user.id} userSettings={{
            ...userSettings,
            name: userSettings?.name ?? workspace?.name ?? '',
            picture_url: userSettings?.picture_url ?? workspace?.picture_url ?? '',
            calendar: userSettings?.calendar ?? '',
            preferences: userSettings?.preferences ?? {},
          }} callback={props.paths.callback} userRole={role ?? ''	} />
        </TabsContent>
        <TabsContent value="subscription">
          <BillingContainerConfig tab={tab ?? ''} />
        </TabsContent>
        
        {role === 'agency_owner' && (
          <TabsContent value="invoices">
            <InvoiceSettings role={role} />
          </TabsContent>
        )}
        
        {role === 'agency_owner' && (
          <TabsContent value="payments">
            <PaymentSettings role={role} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}