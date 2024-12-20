import Link from 'next/link';

import { LanguageSelector } from '@kit/ui/language-selector';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';

import UpdateImage from '../../../../../apps/web/app/components/ui/update-image';
import { Account } from '../../../../../apps/web/lib/account.types';
import { useOrganizationSettings } from '../context/organization-settings-context';
import LoomPublicIdContainer from './personal-account-settings/loom-public-id-container';
import UpdateAccountColorBrand from './personal-account-settings/update-account-color-brand';
import { UpdateAccountOrganizationName } from './personal-account-settings/update-account-organization-name';
import { UpdateAccountOrganizationSenderEmailAndSenderDomain } from './personal-account-settings/update-account-organization-sender-email-and-sender-domain';
import { UpdateAccountOrganizationSenderName } from './personal-account-settings/update-account-organization-sender-name';
import UpdateAccountOrganizationSidebar from './personal-account-settings/update-account-organization-sidebar';
import { ThemedButton } from './ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { TreliDialog } from './personal-account-settings/treli/treli-dialog';


interface SiteSettingsProps {
  role: string;
  handleChangeLanguage: (locale: string) => void;
  user: Account.Type;
  accountStripe: AccountStripe;
}

type AccountStripe = {
  id: string;
  charges_enabled: boolean;
};

function SiteSettings({
  role,
  handleChangeLanguage,
  user,
  accountStripe,
}: SiteSettingsProps) {
  const { t } = useTranslation('account');
  const { logo_url, logo_dark_url, updateOrganizationSetting, favicon_url } =
    useOrganizationSettings();

  const bucketStorage = {
    id: user?.organization_id ?? '',
    name: 'organization',
    identifier: '',
  };

  return (
    <div className='"flex mt-4 w-full flex-wrap gap-6 pb-32 pr-48 text-sm lg:flex-nowrap'>
      {role === 'agency_owner' && (
        <div className="flex w-full flex-col space-y-6">
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                <Trans i18nKey={'accounts:brandName'} />
              </p>
            </div>

            <UpdateAccountOrganizationName />
          </div>
          <Separator />
          <div className="flex justify-between">
            <p className="mr-7 w-[45%] whitespace-nowrap font-bold text-gray-700">
              <Trans i18nKey={'accounts:language'} />
            </p>
            <LanguageSelector onChange={handleChangeLanguage} />
          </div>
          <Separator />
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {' '}
                <Trans i18nKey={'accounts:brandColor'} />
              </p>
            </div>
            <div className='flex w-full flex-col gap-2'>
              <UpdateAccountColorBrand />
            </div>
          </div>
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                <Trans i18nKey={'accounts:brandSidebar'} />
              </p>
            </div>
            <div className='flex w-full flex-col gap-2'>
              <UpdateAccountOrganizationSidebar />
            </div>
          </div>
          <Separator />
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {' '}
                <Trans i18nKey={'accounts:brandLogo'} />
              </p>
              <p className="text-wrap">
                <Trans i18nKey={'accounts:brandLogoDescription'} />
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <p className="font-bold text-gray-700">
                <Trans i18nKey={'accounts:lightVersion'} />
              </p>

              <UpdateImage
                bucketStorage={{
                  ...bucketStorage,
                  identifier: 'lightLogo',
                }}
                defaultImageURL={logo_url ?? ''}
                className="aspect-square h-20 w-20"
                onUpdate={async (value: string) => {
                  await updateOrganizationSetting.mutateAsync({
                    key: 'logo_url',
                    value: value,
                  });
                }}
              />
            </div>
          </div>

          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700"></div>
            <div className="flex w-full flex-col gap-2">
              <p className="font-bold text-gray-700">
                <Trans i18nKey={'accounts:darkVersion'} />
              </p>

              <UpdateImage
                bucketStorage={{
                  ...bucketStorage,
                  identifier: 'darkLogo',
                }}
                defaultImageURL={logo_dark_url ?? ''}
                className="aspect-square h-20 w-20"
                onUpdate={async (value: string) => {
                  await updateOrganizationSetting.mutateAsync({
                    key: 'logo_dark_url',
                    value: value,
                  });
                }}
              />
            </div>
          </div>
          <Separator />
          <div className="flex gap-20">
            <div className="mr-7 flex w-[30%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                <Trans i18nKey={'accounts:brandFavicon'} />
              </p>
              <p className="text-wrap">
                <Trans i18nKey={'accounts:brandFaviconDescription'} />
              </p>
            </div>
            <div className="w-full">
              <UpdateImage
                bucketStorage={{
                  ...bucketStorage,
                  identifier: 'favicon',
                }}
                defaultImageURL={favicon_url ?? ''}
                className="aspect-square h-20 w-20"
                onUpdate={async (value: string) => {
                  await updateOrganizationSetting.mutateAsync({
                    key: 'favicon_url',
                    value: value,
                  });
                }}
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {' '}
                <Trans i18nKey={'accounts:loomAppIdTitle'} />
              </p>
              <p className="text-wrap">
                {' '}
                <Trans i18nKey={'accounts:loomAppIdDescription'} />
              </p>
            </div>
            <LoomPublicIdContainer
              organizationId={user?.organization_id ?? ''}
              userId={user?.id ?? ''}
            />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                <Trans i18nKey={'accounts:brandSenderName'} />
              </p>
            </div>
            <UpdateAccountOrganizationSenderName />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="text-wrap font-bold">
                <Trans i18nKey={'accounts:brandSenderEmailAndDomain'} />
              </p>
            </div>
            <UpdateAccountOrganizationSenderEmailAndSenderDomain />
          </div>
          <Separator />
          <div className="flex justify-between">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {!accountStripe?.id ? (
                  t('connectToStripe')
                ) : accountStripe.charges_enabled ? (
                  t('stripeConnected')
                ) : (
                  t('continueWithOnboardingStripe')
                )}
              </p>
              <p className="text-wrap">
                {!accountStripe?.id ? (
                  t('connectToStripeDescription')
                ) : accountStripe.charges_enabled ? (
                  t('stripeConnectedDescription')
                ) : (
                  t('continueWithOnboardingStripeDescription')
                )}
              </p>
            </div>
            {(!accountStripe?.id || !accountStripe.charges_enabled) && (
              <ThemedButton className="w-full">
                <Link href={'/stripe'} className="h-full w-full">
                  {accountStripe?.id ? <Trans i18nKey={'account:connect'} /> : <Trans i18nKey={'account:continue'} />}
                </Link>
              </ThemedButton>
            )}
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('treli.connectTitle')}
              </p>
              <p className="text-wrap">
              {t('treli.connectDescription')}
              </p>
            </div>
            {user && <TreliDialog userId={user?.id} />}
          </div>
        </div>
      )}
    </div>
  );
}

export default SiteSettings;
