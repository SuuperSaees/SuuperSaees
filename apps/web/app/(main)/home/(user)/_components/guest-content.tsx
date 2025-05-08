'use client';

import { useTranslation } from 'react-i18next';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import Link from 'next/link';
import pathsConfig from '~/config/paths.config';
import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export function GuestContent() {
    const supabase = useSupabase();
    const signOut = useSignOut();
    const handleSignOut = async () => {
        const impersonatingTokenId = localStorage.getItem("impersonatingTokenId");
        if (impersonatingTokenId){
          localStorage.removeItem('impersonatingTokenId');
          await deleteToken(impersonatingTokenId);
        }
        const { error: userError } = await supabase.auth.getUser();
        if(!userError){
          await signOut.mutateAsync()
        }
      }

    const { t } = useTranslation('auth');
    return (
        <>
        <div className="text-center text-sm text-gray-500">
        {t('guest.signInToAccessOrders')}
        </div>
        <Link href={pathsConfig.auth.signIn}>
            <ThemedButton onClick={handleSignOut} className='w-full'>{t('signIn')}</ThemedButton>
        </Link>
        </>
    )
}