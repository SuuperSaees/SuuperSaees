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
import { 
  canAccessTab, 
  shouldShowTabsList, 
  getDefaultTab,
  UserRole,
  TabName 
} from '../../utils/role-permissions';


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
  const role = workspace.role as UserRole;

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
        
        // Use role-based default tab selection
        if (!tab) {
          setAccountBillingTab(getDefaultTab(role));
        } else {
          // Validate that the user can access the requested tab
          if (canAccessTab(role, tab as TabName)) {
            setAccountBillingTab(tab);
          } else {
            setAccountBillingTab(getDefaultTab(role));
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    void fetchUserRole();
  }, [tab, checkoutResult, role]);
  
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
      <Tabs defaultValue={getDefaultTab(role)} value={accountBillingTab} onValueChange={(value: string) => setAccountBillingTab(value)}>
        {shouldShowTabsList(role) && (
          <div className="flex items-center justify-between pb-[24px]">
          <TabsList className='gap-2 bg-transparent '>
            {canAccessTab(role, 'site') && (
              <ThemedTabTrigger
                value="site"
                option="site"
                activeTab={accountBillingTab}
              >
                Portal
              </ThemedTabTrigger>
            )}
            
            {canAccessTab(role, 'profile') && (
              <ThemedTabTrigger
                value="profile"
                option="profile"
                activeTab={accountBillingTab}
              >
                {t('profileTab')}
              </ThemedTabTrigger>
            )}

            {canAccessTab(role, 'subscription') && (
              <ThemedTabTrigger
                value="subscription"
                option="subscription"
                activeTab={accountBillingTab}
              >
                {t('subscriptionTab')}
              </ThemedTabTrigger>
            )}

            {canAccessTab(role, 'invoices') && (
              <ThemedTabTrigger
                value="invoices"
                option="invoices"
                activeTab={accountBillingTab}
              >
                {t('invoicesTab')}
              </ThemedTabTrigger>
            )}

            {canAccessTab(role, 'payments') && (
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
        
        {canAccessTab(role, 'site') && (
          <TabsContent value="site">
            <SiteSettings role={role} handleChangeLanguage={handleChangeLanguage} user={user}/>
          </TabsContent>
        )}
        
        {canAccessTab(role, 'profile') && (
          <TabsContent value="profile">
            <ProfileSettings userId={user.id} userSettings={{
              ...userSettings,
              name: userSettings?.name ?? workspace?.name ?? '',
              picture_url: userSettings?.picture_url ?? workspace?.picture_url ?? '',
              calendar: userSettings?.calendar ?? '',
              preferences: userSettings?.preferences ?? {},
            }} callback={props.paths.callback} userRole={role ?? ''} />
          </TabsContent>
        )}
        
        {canAccessTab(role, 'subscription') && (
          <TabsContent value="subscription">
            <BillingContainerConfig tab={tab ?? ''} />
          </TabsContent>
        )}
        
        {canAccessTab(role, 'invoices') && (
          <TabsContent value="invoices">
            <InvoiceSettings role={role} />
          </TabsContent>
        )}
        
        {canAccessTab(role, 'payments') && (
          <TabsContent value="payments">
            <PaymentSettings role={role} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}