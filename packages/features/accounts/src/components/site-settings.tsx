import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { LanguageSelector } from '@kit/ui/language-selector';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';

import { Account } from '../../../../../apps/web/lib/account.types';
import { getDomainByUserId } from '../../../../multitenancy/utils/get/get-domain';
import UpdateAccountColorBrand from './personal-account-settings/update-account-color-brand';
import UpdateAccountOrganizationDarkLogo from './personal-account-settings/update-account-organization-dark-logo';
import UpdateAccountOrganizationFavicon from './personal-account-settings/update-account-organization-favicon';
import UpdateAccountOrganizationLogo from './personal-account-settings/update-account-organization-logo';
import { UpdateAccountOrganizationName } from './personal-account-settings/update-account-organization-name';
import { UpdateAccountOrganizationSenderEmailAndSenderDomain } from './personal-account-settings/update-account-organization-sender-email-and-sender-domain';
import { UpdateAccountOrganizationSenderName } from './personal-account-settings/update-account-organization-sender-name';
import UpdateAccountOrganizationSidebar from './personal-account-settings/update-account-organization-sidebar';
import { ThemedButton } from './ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

interface SiteSettingsProps {
  role: string;
  handleChangeLanguage: (locale: string) => void;
  user: Account.Type;
}

type AccountStripe = {
  id: string;
  charges_enabled: boolean;
};

function SiteSettings({ role, handleChangeLanguage, user }: SiteSettingsProps) {
  const {t} = useTranslation('account');

  const [accountStripe, setAccountStripe] = useState<AccountStripe>({
    id: '',
    charges_enabled: false,
  });

  const [userData, setUserData] = useState<Account.Type | null>();

  const client = useSupabase();

  const fetchUserAccount = async () => {
    const { data: userData, error: userAccountError } = await client
      .from('accounts')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userAccountError) console.error(userAccountError.message);
    return userData;
  };

  useEffect(() => {
    let user: Account.Type | null;
    void fetchUserAccount()
      .then((data) => {
        setUserData(data);
        user = data;
      })
      .then(() => {
        const fetchAccountStripe = async () => {
          const stripeId = user?.stripe_id as string;
          if (stripeId) {
            try {
              const { domain: baseUrl } = await getDomainByUserId(
                user?.id ?? '',
                true,
              );
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

  return (
    <div className='"flex mt-4 w-full flex-wrap gap-6 pb-32 pr-48 lg:flex-nowrap'>
      {role === 'agency_owner' && (
        <div className="flex w-full flex-col space-y-6">
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandName')}</p>
            </div>

            <UpdateAccountOrganizationName />
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="mr-7 w-[45%] whitespace-nowrap font-bold text-gray-700">
              {t('language')}
            </p>
            <LanguageSelector onChange={handleChangeLanguage} />
          </div>
          <Separator />
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandLogo')}</p>
              <p className="text-wrap">
                {t('brandLogoDescription')}
              </p>
            </div>
            <div className=' flex flex-col gap-2'>
              <p className='font-bold text-gray-700'>{t('lightVersion')}</p>
              <UpdateAccountOrganizationLogo
                organizationId={user?.organization_id ?? ''}
                className="h-20 w-20"
              />
            </div>
          </div>

          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              {/* <p className="font-bold">Dark brand logo</p> */}
              {/* <p>{t('accountImageDescription')}</p> */}
            </div>
            <div className=' flex flex-col gap-2'>
              <p className='font-bold text-gray-700'>{t('darkVersion')}</p>
              <UpdateAccountOrganizationDarkLogo
                organizationId={user?.organization_id ?? ''}
                className="h-20 w-20"
              />
            </div>
          </div>
          <Separator />
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandFavicon')}</p>
              <p className='text-wrap'>{t('brandFaviconDescription')}</p>
            </div>
            <div>
              <UpdateAccountOrganizationFavicon className="h-20 w-20" />
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandSenderName')}</p>
            </div>
            <UpdateAccountOrganizationSenderName />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandSenderEmailAndDomain')}</p>
            </div>
            <UpdateAccountOrganizationSenderEmailAndSenderDomain />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandColor')}</p>
            </div>
            <UpdateAccountColorBrand />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">{t('brandSidebar')}</p>
            </div>
            <UpdateAccountOrganizationSidebar />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {!accountStripe?.id ? (
                  <Trans i18nKey={'account:connectToStripe'} />
                ) : accountStripe.charges_enabled ? (
                  <Trans i18nKey={'account:stripeConnected'} />
                ) : (
                  <Trans i18nKey={'account:continueWithOnboardingStripe'} />
                )}
              </p>
              <p className="text-wrap">
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
              </p>
            </div>
            {(!accountStripe?.id || !accountStripe.charges_enabled) && (
              <ThemedButton className="w-full">
                <Link href={'/stripe'} className='w-full h-full'>
                  {accountStripe?.id ? 'Connect' : 'Continue'}
                </Link>
              </ThemedButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteSettings;
