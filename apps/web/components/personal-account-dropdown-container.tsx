'use client';

import type { User } from '@supabase/supabase-js';

import { PersonalAccountDropdown } from '@kit/accounts/personal-account-dropdown';
import { useSignOut } from '@kit/supabase/hooks/use-sign-out';
import { useUser } from '@kit/supabase/hooks/use-user';

import featuresFlagConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';
import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

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
  const supabase = useSupabase();
  const { sidebar_background_color } = useOrganizationSettings();
  const sidebarBackgroundColor = sidebar_background_color ?? '#f2f2f2';

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

  return (
    <div className={props.collapsed ? '' : 'w-full rounded-md'} style={{ backgroundColor: sidebarBackgroundColor }}>
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
