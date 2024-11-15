import { useCallback, useState } from 'react';

import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { LanguageSelector } from '@kit/ui/language-selector';
import { Separator } from '@kit/ui/separator';
import { Textarea } from '@kit/ui/textarea';

import { Account } from '../../../../../apps/web/lib/account.types';
import { updateUserAccount } from '../../../../../packages/features/team-accounts/src/server/actions/members/update/update-account';
import { UpdateEmailFormContainer } from './personal-account-settings/email/update-email-form-container';
import { UpdatePasswordFormContainer } from './personal-account-settings/password/update-password-container';
import { UpdateAccountDetailsFormContainer } from './personal-account-settings/update-account-details-form-container';
import { UpdateAccountImageContainer } from './personal-account-settings/update-account-image-container';
import { ThemedButton } from './ui/button-themed-with-settings';

interface ProfileSettingsProps {
  user: Account.Type;
  callback: string;
  handleChangeLanguage: (locale: string) => void;
}

function ProfileSettings({
  user,
  callback,
  handleChangeLanguage,
}: ProfileSettingsProps) {
  const { t } = useTranslation('account');
  const [calendarValue, setCalendarValue] =
    useState<Account.Type['calendar']>(user.calendar ?? '');
  const [isValidUrl, setIsValidUrl] = useState(true);

  const validateUrl = useCallback((url: string) => {
    if (url === '') return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  const updateAccountCalendar = useMutation({
    mutationFn: async (calendar: Account.Type['calendar']) => {
      if (user?.id) {
        await updateUserAccount({ calendar: calendar }, user.id);
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
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                pictureUrl: user.picture_url,
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
            <p>{t('nameDescription')}</p>
          </div>

          <UpdateAccountDetailsFormContainer user={user} />
        </div>

        <Separator />

        <div className="flex justify-between">
          <p className="mr-7 w-[45%] whitespace-nowrap font-bold text-gray-700">
            {t('language')}
          </p>
          <LanguageSelector onChange={handleChangeLanguage} />
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
            <p className="whitespace-nowrap font-bold">{t('calendar')}</p>
            <p>{t('calendarDescription')}</p>
          </div>
          <div className="flex w-full flex-col gap-4">
            <Textarea
              placeholder={t('pasteCalendar')}
              rows={8}
              value={calendarValue}
              onChange={handleCalendarChange}
              className={
                !isValidUrl && calendarValue !== '' ? 'border-red-500' : ''
              }
            />
            {!isValidUrl && calendarValue !== '' && (
              <p className="text-sm text-red-500">Please enter a valid URL</p>
            )}
            <ThemedButton
              className="w-full"
              onClick={() => updateAccountCalendar.mutate(calendarValue)}
              disabled={!isValidUrl}
            >
              {t('saveCalendar')}
            </ThemedButton>
          </div>
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
