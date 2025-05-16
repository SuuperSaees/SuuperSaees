'use client';

import { UpdatePasswordFormContainer } from './update-password-form';
import { AuthLayout } from '~/(authentication)/auth/components/auth-layout';
import { useAuthDetails } from '@kit/auth/sign-in';
import { useTranslation } from 'react-i18next';

export const SetPasswordForm = () => {
  const baseUrl = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const { authDetails, isLoading } = useAuthDetails(baseUrl);
  const isProd = baseUrl !== 'localhost:3000';
  const { t } = useTranslation('account');
  const callbackPath = `${isProd ? 'https://' : 'http://'}${baseUrl}`;
  return (
    <AuthLayout authDetails={authDetails} isLoading={isLoading}>
      <div className='flex flex-col w-full gap-6 mb-6'>
      <span className="text-3xl font-bold text-black">
          {t('updatePassword.title')}
        </span>

        <span>{t('updatePassword.description')}</span>
      </div>
        <UpdatePasswordFormContainer callbackPath={`${callbackPath}/home`} className={'w-full self-center'} />
                {/* Or sign-up */}
                <div className="flex w-full flex-col items-center gap-3 text-sm">
          <div className="flex w-full items-center justify-center gap-8">
            <div className="h-[1px] w-full bg-gray-200"></div>
            <span className="text-gray-500">
              {t('updatePassword.or.title')}
            </span>
            <div className="h-[1px] w-full bg-gray-200"></div>
          </div>
          <div className="flex items-center gap-2">
            <span>{t('updatePassword.or.question')}</span>
            <a href={`${callbackPath}/home`} className="underline">
              {t('updatePassword.or.link')}
            </a>
          </div>
        </div>
    </AuthLayout>
  );
};
