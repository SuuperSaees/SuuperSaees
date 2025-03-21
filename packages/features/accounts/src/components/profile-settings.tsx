import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Input } from '@kit/ui/input';
import { LanguageSelector } from '@kit/ui/language-selector';
import { Separator } from '@kit/ui/separator';

import UpdateImage from '../../../../../apps/web/app/components/ui/update-image';
import { Account } from '../../../../../apps/web/lib/account.types';
import { UserSettings } from '../../../../../apps/web/lib/user-settings.types';
import { updateUserSettings } from '../../../../../packages/features/team-accounts/src/server/actions/members/update/update-account';
import { useRevalidatePersonalAccountDataQuery } from '../hooks/use-personal-account-data';
import { UpdateEmailFormContainer } from './personal-account-settings/email/update-email-form-container';
import { UpdatePasswordFormContainer } from './personal-account-settings/password/update-password-container';
import { UpdateAccountDetailsFormContainer } from './personal-account-settings/update-account-details-form-container';

interface ProfileSettingsProps {
  user: Account.Type;
  userSettings: UserSettings.Type;
  callback: string;
  userRole: string;
}

function ProfileSettings({
  user,
  callback,
  userSettings,
  userRole,
}: ProfileSettingsProps) {
  const { t } = useTranslation('account');
  const [calendarValue, setCalendarValue] = useState(userSettings?.calendar ?? '');
  const [isValidUrl, setIsValidUrl] = useState(true);
  const revalidateAccount = useRevalidatePersonalAccountDataQuery();
  
  const validateUrl = useCallback((url: string) => {
    if (url === '') return true;
    try {
      const parsedUrl = new URL(url);
      const allowedDomains = [
        'hubspot.com',
        'calendly.com',
        'cal.com',
        'google.com',
        'outlook.com',
        'outlook.office.com',
        'tidycal.com',
        'calendar.app.google'
      ];
      const domain = parsedUrl.hostname.replace('www.', '');
      return allowedDomains.some((allowedDomain) =>
        domain.endsWith(allowedDomain),
      );
    } catch (e) {
      return false;
    }
  }, []);

  const updateAccountCalendar = useMutation({
    mutationFn: async (calendar: UserSettings.Type['calendar']) => {
      if (user?.id) {
        await updateUserSettings(user.id, { calendar: calendar ?? '' });
      } else {
        throw new Error('User ID is undefined');
      }
    },
    onSuccess: () => {
      toast.success(t('updateSuccess'), {
        description: t('updateCalendarSuccess'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('updateCalendarError'),
      });
    },
  });
  
  const handleLanguageChange = useCallback(async (locale: string) => {
    if (user?.id) {
      try {
        // Update the user's language preference in the database
        await updateUserSettings(user.id, { 
          preferences: {
            user: {
              language: locale
            }
          }
        });
        
        // Show success message
        toast.success(t('updateSuccess'), {
          description: t('updateLanguageSuccess'),
        });
        

      } catch (error) {
        toast.error('Error', {
          description: t('updateLanguageError'),
        });
        console.error('Error updating language preference:', error);
      }
    }
  }, [user?.id, t]);

  const handleCalendarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCalendarValue(value);
      setIsValidUrl(validateUrl(value));
    },
    [validateUrl],
  );
  
  const clientRoles = new Set(['client_owner', 'client_member']);

  const bucketStorage = {
    id: user?.id ?? '',
    name: 'account_image',
    identifier: 'profilePicture',
  };

  const updateProfileImage = async (value: string) => {
    try {
      await updateUserSettings(user?.id ?? '', { picture_url: value });
      toast.success(t('updateSuccess'), {
        description: t('updateProfileSuccess'),
      });
      await revalidateAccount(user?.id ?? '');
    } catch (error) {
      toast.error('Error', {
        description: t('updateProfileError'),
      });
      console.error(error);
    }
  };

  return (
    <div className='"flex mt-4 w-full flex-wrap gap-6 pb-32 pr-48 text-sm lg:flex-nowrap'>
      <div className="flex w-full flex-col space-y-6">
        <div className="flex justify-between">
          <div className="mr-7 w-[45%] flex flex-col whitespace-nowrap text-gray-700">
            <p className="font-bold">{t('accountImage')}</p>
            <p>{t('accountImageDescription')}</p>
          </div>
          <div className="w-[100%]">
            <UpdateImage
              bucketStorage={bucketStorage}
              defaultImageURL={
                userSettings?.picture_url ?? user?.picture_url ?? ''
              }
              className="aspect-square h-20 w-20 [&>img]:object-cover"
              onUpdate={updateProfileImage}
            />
          </div>
        </div>
        <Separator />

        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
            <p className="font-bold">{t('name')}</p>
            <p className="text-wrap">{t('nameDescription')}</p>
          </div>

          <UpdateAccountDetailsFormContainer user={user} />
        </div>

        <Separator />
        
        {/* Language Preference Section */}
        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col text-gray-700">
            <p className="whitespace-nowrap font-bold">{t('language')}</p>
            <p>{t('languageDescription')}</p>
          </div>
          <div className="flex w-full flex-col gap-4">
            <LanguageSelector onChange={handleLanguageChange} />
          </div>
        </div>
        
        <Separator />
        
        {!clientRoles.has(userRole) && (
          <>
            <div className="flex justify-between">
              <div className="mr-7 flex w-[45%] flex-col text-gray-700">
                <p className="whitespace-nowrap font-bold">{t('calendar')}</p>
                <p>{t('calendarDescription')}</p>
              </div>
              <div className="flex w-full flex-col gap-4">
                <Input
                  placeholder={t('pasteCalendar')}
                  value={calendarValue}
                  onChange={handleCalendarChange}
                  className={
                    !isValidUrl && calendarValue !== '' ? 'border-red-500' : ''
                  }
                  onBlur={() => {
                    if (isValidUrl) {
                      updateAccountCalendar.mutate(calendarValue);
                    }
                  }}
                />
                {!isValidUrl && calendarValue !== '' && (
                  <p className="text-sm text-red-500">
                    Please enter a valid URL
                  </p>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col text-gray-700">
            <p className="whitespace-nowrap font-bold">
              {t('updateEmailCardTitle')}
            </p>
            <p>{t('updateEmailCardDescription')}</p>
          </div>
          <UpdateEmailFormContainer callbackPath={callback} />
        </div>
        <Separator />
        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col text-gray-700">
            <p className="whitespace-nowrap font-bold">
              {t('updatePasswordCardTitle')}
            </p>
            <p>{t('updatePasswordCardDescription')}</p>
          </div>
          <UpdatePasswordFormContainer callbackPath={callback} />
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
