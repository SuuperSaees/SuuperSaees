'use client';

import Link from 'next/link';

import { PasswordResetRequestContainer } from '@kit/auth/password-reset';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';
import { useAuthDetails } from '../../../../../../packages/features/auth/src/hooks/use-auth-details';
import { getTextColorBasedOnBackground } from '~/utils/generate-colors';
import { Spinner } from '@kit/ui/spinner';

export function PasswordReset() {
    let host = 'localhost:3000';
    if (typeof window !== 'undefined') {
      host = window.location.host;
    }
    const { authDetails, isLoading } = useAuthDetails(host);

    if (isLoading) {
        return <div className='flex flex-col items-center justify-center w-full h-full'>
            <Spinner />
        </div>
    }

    const { callback, signIn } = pathsConfig.auth;
    const { setPassword } = pathsConfig.app;
    const redirectPath = `${callback}?next=${setPassword}`;
    return (
        <div className='flex flex-col items-center justify-center w-full h-full' style={{
            color: getTextColorBasedOnBackground(
              authDetails?.auth_card_background_color
                ? authDetails.auth_card_background_color
                : '#ffffff',
            ),
            background: authDetails?.auth_section_background_color
            ? authDetails.auth_section_background_color
            : authDetails?.background_color,
        }}>
          <h4 className='scroll-m-20 font-heading text-lg font-semibold tracking-tight lg:text-xl' style={{
            color: getTextColorBasedOnBackground(
                authDetails?.auth_section_background_color
                ? authDetails.auth_section_background_color
                : authDetails?.background_color ?? '#ffffff'
            ),
          }} >
            <Trans i18nKey={'auth:passwordResetLabel'} />
          </h4>
    
          <div className={'flex flex-col space-y-4'}>
            <PasswordResetRequestContainer redirectPath={redirectPath} themeColor={authDetails?.theme_color} backgroundColor={authDetails?.background_color} />
    
            <div className={'flex justify-center text-xs'}>
              <Button asChild variant={'link'} size={'sm'} style={{
                color: getTextColorBasedOnBackground(
                  authDetails?.auth_section_background_color
                    ? authDetails.auth_section_background_color
                    : authDetails?.background_color ?? '#ffffff'
                ),
              }}>
                <Link href={signIn}>
                  <Trans i18nKey={'auth:passwordRecoveredQuestion'} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
}


