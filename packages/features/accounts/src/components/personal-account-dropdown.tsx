'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { revalidateSession } from '../../../../../apps/web/app/server/actions/accounts/accounts.action';
import type { User } from '@supabase/supabase-js';

import {
  EllipsisVertical,
  Home,
  LogOut,
  // MessageCircleQuestion,
  Shield,
  Users,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { If } from '@kit/ui/if';
// import { SubMenuModeToggle } from '@kit/ui/mode-toggle';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';
import {getTokenData} from '../../../team-accounts/src/server/actions/tokens/get/get-token'
import {deleteToken} from '../../../team-accounts/src/server/actions/tokens/delete/delete-token'
import { usePersonalAccountData } from '../hooks/use-personal-account-data';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export function PersonalAccountDropdown({
  className,
  user,
  signOutRequested,
  showProfileName,
  paths,
  account,
}: {
  user: User;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };

  signOutRequested: () => unknown;

  paths: {
    home: string;
    orders: string;
  };

  features: {
    enableThemeToggle: boolean;
  };

  className?: string;
  showProfileName?: boolean;
}) {
  const { data: personalAccountData } = usePersonalAccountData(
    user.id,
    account,
  );

  const signedInAsLabel = useMemo(() => {
    const email = user?.email ?? undefined;
    const phone = user?.phone ?? undefined;

    return email ?? phone;
  }, [user]);

  const displayName =
    personalAccountData?.name ?? account?.name ?? user?.email ?? '';

  const isSuperAdmin = useMemo(() => {
    return user?.app_metadata.role === 'super-admin';
  }, [user]);

  const supabase = useSupabase();
  const router = useRouter();
  const [impersonatingTokenId, setImpersonatingTokenId] = useState('');
  const {t} = useTranslation('common');

  //This useEffect is used to gain access to localStorage in a client/browser context
  useEffect(() => {
    setImpersonatingTokenId(localStorage.getItem('impersonatingTokenId') ?? '');
  }, []);

  // The log below is used to see the current session every time
  // const logSession = async () => {
  //   console.log(await supabase.auth.getSession());
  // };

  // useEffect(() => {
  //   logSession().catch(console.error);
  // }, []);

  const domain = (typeof window !== 'undefined' 
    ? window.location.origin.replace(/^https?:\/\//, '')
    : '');

  const stopImpersonating = async () => {
    const token = await getTokenData(impersonatingTokenId);
    if (token) {
      toast.success(t('success'), {
        description: t('stopImpersonatingDescription'),
      });
      localStorage.removeItem('impersonatingTokenId');
      await deleteToken(impersonatingTokenId);
      await supabase.auth.setSession({
        refresh_token: token.refresh_token,
        access_token: token.access_token,
      });
      await supabase.rpc('set_session', {
        domain,
      });
      await revalidateSession();
      localStorage.clear();
      
      //Push to /home page and then use refresh to reload the page with updated user data
      router.push('/home');
      window.location.reload();
      router.refresh()
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Open your profile menu"
        data-test={'account-dropdown-trigger'}
        className={cn(
          'animate-in fade-in group flex cursor-pointer items-center focus:outline-none',
          className ?? '',
          {
            ['active:bg-secondary/50 items-center space-x-2.5 rounded-md' +
            ' hover:bg-secondary p-2 transition-colors']: showProfileName,
          },
        )}
      >
        <ProfileAvatar
          displayName={displayName ?? user?.email ?? ''}
          pictureUrl={personalAccountData?.picture_url}
        />

        <If condition={showProfileName}>
          <div
            className={
              'fade-in animate-in flex w-full flex-col truncate text-left'
            }
          >
            <span
              data-test={'account-dropdown-display-name'}
              className={'truncate text-sm'}
            >
              {displayName}
            </span>

            <span
              data-test={'account-dropdown-email'}
              className={'truncate text-xs'}
            >
              {signedInAsLabel}
            </span>
          </div>

          <EllipsisVertical
            className={'text-muted-foreground mr-1 hidden h-8 group-hover:flex'}
          />
        </If>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className={'xl:!min-w-[15rem]'}
        collisionPadding={{ right: 20, left: 20 }}
        sideOffset={10}
      >
        <DropdownMenuItem className={'!h-10 rounded-none'}>
          <div
            className={'flex flex-col justify-start truncate text-left text-xs'}
          >
            <div className={'text-muted-foreground'}>
              <Trans i18nKey={'common:signedInAs'} />
            </div>

            <div>
              <span className={'block truncate'}>{signedInAsLabel}</span>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            className={'s-full flex items-center space-x-2'}
            href={paths.orders}
          >
            <Home className={'h-5'} />

            <span>
              <Trans i18nKey={'common:homeTabLabel'} />
            </span>
          </Link>
        </DropdownMenuItem>


        {/* <DropdownMenuItem asChild>
          <Link className={'s-full flex items-center space-x-2'} href={'/docs'}>
            <MessageCircleQuestion className={'h-5'} />

            <span>
              <Trans i18nKey={'common:documentation'} />
            </span>
          </Link>
        </DropdownMenuItem> */}

        <If condition={isSuperAdmin}>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              className={'s-full flex items-center space-x-2'}
              href={'/admin'}
            >
              <Shield className={'h-5'} />

              <span>Admin</span>
            </Link>
          </DropdownMenuItem>
        </If>


        {/* <If condition={features.enableThemeToggle}>
          <SubMenuModeToggle />
        </If> */}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          data-test={'account-dropdown-sign-out'}
          role={'button'}
          className={'cursor-pointer'}
          onClick={signOutRequested}
        >
          <span className={'flex w-full items-center space-x-2'}>
            <LogOut className={'h-5'} />

            <span>
              <Trans i18nKey={'auth:signOut'} />
            </span>
          </span>
        </DropdownMenuItem>
        {
          impersonatingTokenId &&
          <>
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className={'cursor-pointer'}
              onClick={stopImpersonating}
            >
              <span className={'flex w-full items-center space-x-2'}>
                <Users className='h-5' />
                <span className={'flex w-full items-center space-x-2'}>
                  {t('stopImpersonating')}
                </span>
              </span>
            </DropdownMenuItem>
          </>
        }
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
