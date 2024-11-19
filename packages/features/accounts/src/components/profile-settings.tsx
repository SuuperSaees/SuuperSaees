import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Separator } from '@kit/ui/separator';

import { Account } from '../../../../../apps/web/lib/account.types';
import { updateUserSettings } from '../../../../../packages/features/team-accounts/src/server/actions/members/update/update-account';
import { UpdateEmailFormContainer } from './personal-account-settings/email/update-email-form-container';
import { UpdatePasswordFormContainer } from './personal-account-settings/password/update-password-container';
import { UpdateAccountDetailsFormContainer } from './personal-account-settings/update-account-details-form-container';
import { UpdateAccountImageContainer } from './personal-account-settings/update-account-image-container';
import { Input } from '@kit/ui/input';
import { UserSettings } from '../../../../../apps/web/lib/user-settings.types';

interface ProfileSettingsProps {
  user: Account.Type;
  userSettings : UserSettings.Type;
  callback: string;
  handleChangeLanguage: (locale: string) => void;
}

function ProfileSettings({
  user,
  callback,
  handleChangeLanguage,
  userSettings,
}: ProfileSettingsProps) {
  const { t } = useTranslation('account');
  const [calendarValue, setCalendarValue] =
    useState<UserSettings.Type['calendar']>(userSettings?.calendar ?? '');
  const [isValidUrl, setIsValidUrl] = useState(true);


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
        'tidycal.com'
      ];
      const domain = parsedUrl.hostname.replace('www.', '');
      return allowedDomains.some(allowedDomain => domain.endsWith(allowedDomain));
    } catch (e) {
      return false;
    }
  }, []);

  const updateAccountCalendar = useMutation({
    mutationFn: async (calendar: UserSettings.Type['calendar']) => {
      if (user?.id) {
        await updateUserSettings(user.id, { calendar: calendar ?? ''});
      } else {
        throw new Error('User ID is undefined');
      }
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Calendar updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Could not update calendar.',
      });
    },
  });

  const handleCalendarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCalendarValue(value);
      setIsValidUrl(validateUrl(value));
    },
    [validateUrl],
  );
  return (
    <div className='"flex mt-4 w-full flex-wrap gap-6 pb-32 pr-48 lg:flex-nowrap'>
      <div className="flex w-full flex-col space-y-6">
        <div className="flex gap-48">
          <div className="mr-7 flex flex-col whitespace-nowrap text-gray-700">
            <p className="font-bold">{t('accountImage')}</p>
            <p>{t('accountImageDescription')}</p>
          </div>
          <div>
            <UpdateAccountImageContainer
              user={{
                pictureUrl: userSettings?.picture_url,
                id: user.id,
              }}
              className="h-20 w-20"
            />
          </div>
        </div>
        <Separator />

        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col whitespace-nowrap text-gray-700">
            <p className="font-bold">{t('name')}</p>
            <p className='text-wrap'>{t('nameDescription')}</p>
          </div>

          <UpdateAccountDetailsFormContainer user={user} />
        </div>

        <Separator />

        <div className="flex justify-between">
          <div className="mr-7 flex w-[45%] flex-col text-gray-700">
            <p className="whitespace-nowrap font-bold">{t('calendar')}</p>
            <p>{t('calendarDescription')}</p>
          </div>
          <div className="flex w-full flex-col gap-4">
            <Input
              placeholder={t('pasteCalendar')}
              rows={8}
              value={calendarValue}
              onChange={handleCalendarChange}
              className={
                !isValidUrl && calendarValue !== '' ? 'border-red-500' : ''
              }
              onBlur={() => {
                if (isValidUrl) {
                  updateAccountCalendar.mutate(calendarValue)
                }
              }}
            />
            {!isValidUrl && calendarValue !== '' && (
              <p className="text-sm text-red-500">Please enter a valid URL</p>
            )}
          </div>
        </div>
        <Separator />
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
