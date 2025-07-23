'use client';
	
import { LanguageSelector } from '@kit/ui/language-selector';
import { Separator } from '@kit/ui/separator';

import UpdateImage from '../../../../../apps/web/app/components/ui/update-image';
import { useOrganizationSettings } from '../context/organization-settings-context';
import UpdateAccountColorBrand from './personal-account-settings/update-account-color-brand';
import { UpdateAccountOrganizationName } from './personal-account-settings/update-account-organization-name';
import { UpdateAccountOrganizationSenderEmailAndSenderDomain } from './personal-account-settings/update-account-organization-sender-email-and-sender-domain';
import { UpdateAccountOrganizationSenderName } from './personal-account-settings/update-account-organization-sender-name';
import UpdateAccountOrganizationSidebar from './personal-account-settings/update-account-organization-sidebar';
import { UpdateAccountOrganizationDomain } from './personal-account-settings/update-account-organization-domain';
import { useUserWorkspace } from '../hooks/use-user-workspace';
import { useTranslation } from 'react-i18next';
interface SiteSettingsProps {
  role: string;
  handleChangeLanguage: (locale: string) => void;
  user: {
    id: string;
    email?: string | null;
    picture_url?: string | null;
    // Add only the fields you actually use in SiteSettings
  };
}

function SiteSettings({
  role,
  handleChangeLanguage,
}: SiteSettingsProps) {
  const { logo_url, logo_dark_url, updateOrganizationSetting, favicon_url, language } =
    useOrganizationSettings();
  const { organization } = useUserWorkspace();

  const {t} = useTranslation('account');

  const bucketStorage = {
    id: organization?.id ?? '',
    name: 'organization',
    identifier: '',
  };

  return (
    <div className='"flex mt-4 w-full flex-wrap gap-6 pb-32 md:pr-48 pr-0 text-sm lg:flex-nowrap'>
      {role === 'agency_owner' && (
        <div className="flex w-full flex-col space-y-6">
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 w-[45%] flex flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandName')}
              </p>
            </div>

            <UpdateAccountOrganizationName />
          </div>
          <Separator />
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <p className="md:mr-7 mr-0 w-[45%] whitespace-nowrap font-bold text-gray-700">
              {t('language')}
            </p>
            <LanguageSelector onChange={handleChangeLanguage} defaultLanguage={language}/>
          </div>
          <Separator />
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 md:w-[45%] w-2/3 flex flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandColor')}
              </p>
            </div>
            <div className="w-[100%]">
              <UpdateAccountColorBrand />
            </div>
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 md:w-[45%] w-2/3 flex flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandSidebar')}
              </p>
            </div>
            <div className="w-[100%]">
              <UpdateAccountOrganizationSidebar />
            </div>
          </div>
          <Separator />
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 md:w-[45%] w-full flex flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandLogo')}
              </p>
              <p className="text-wrap md:max-w-[300px] max-w-full">
                {t('brandLogoDescription')}
              </p>
            </div>
            <div className="w-[100%] flex flex-col gap-2">
              <p className="font-bold text-gray-700">
                {t('lightVersion')}
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

          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 md:w-[45%] w-2/3 flex flex-col whitespace-nowrap text-gray-700"></div>
            <div className="w-[100%] flex flex-col gap-2">
              <p className="font-bold text-gray-700">
                {t('darkVersion')}
              </p>

              <UpdateImage
                bucketStorage={{
                  ...bucketStorage,
                  identifier: 'darkLogo',
                }}
                defaultImageURL={logo_dark_url ?? ''}
                className="aspect-square h-20 w-20 bg-black"
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
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 md:w-[45%] w-full flex flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandFavicon')}
              </p>
              <p className="text-wrap max-w-[300px]">
                {t('brandFaviconDescription')}
              </p>
            </div>
            <div className="w-[100%] flex flex-col">
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
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandDomain')}
              </p>
            </div>
            <UpdateAccountOrganizationDomain organizationId={organization?.id ?? ''} />
          </div>
          <Separator />
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
              <p className="font-bold">
                {t('brandSenderName')}
              </p>
            </div>
            <UpdateAccountOrganizationSenderName />
          </div>
          <Separator />
          <div className="flex flex-wrap md:flex-nowrap gap-4 justify-between md:p-0 p-4">
            <div className="md:mr-7 mr-0 flex md:w-[45%] w-full flex-col whitespace-nowrap text-gray-700">
              <p className="text-wrap font-bold">
                {t('brandSenderEmailAndDomain')}
              </p>
            </div>
            <UpdateAccountOrganizationSenderEmailAndSenderDomain />
          </div>
         
        </div>
      )}
    </div>
  );
}

export default SiteSettings;

