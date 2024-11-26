'use client';

import type { User } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';

const paths = {
  home: pathsConfig.app.home,
  orders: pathsConfig.app.orders
};

const features = {
  enableThemeToggle: featuresFlagConfig.enableThemeToggle,
};

export function ProfileAccountDropdownContainer(props: {
  collapsed: boolean;
  user: User;

  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };
}) {
  const signOut = useSignOut();
  const user = useUser(props.user);
  const userData = user.data as User;

  const handleSignOut = async () => {
    const originalTokenId = localStorage.getItem("originalTokenId");
    if (originalTokenId){
      localStorage.removeItem('impersonating');
      localStorage.removeItem('originalTokenId');
      await deleteToken(originalTokenId);
    }
    await signOut.mutateAsync()
  }

  return (
    <div className={props.collapsed ? '' : 'w-full'}>
      <PersonalAccountDropdown
        className={'w-full'}
        paths={paths}
        features={features}
        showProfileName={!props.collapsed}
        user={userData}
        account={props.account}
        signOutRequested={handleSignOut}
      />
    </div>
  );
}
