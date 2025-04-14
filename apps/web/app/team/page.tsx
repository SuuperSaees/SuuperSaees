import React from 'react';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { loadMembersPageData } from './_lib/server/members-page.loader';
import ClientsMembersPagePresentation from './components/clients-members-page-presentation';
import { loadUserWorkspace } from '~/home/(user)/_lib/server/load-user-workspace';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('team:team'),
  };
};

async function ClientsMembersPage() {
  const client = getSupabaseServerComponentClient();

  const { organization, user: authenticatedUser } = await loadUserWorkspace();

  const { data: accountData, error: accountError } = await client
    .from('accounts')
    .select()
    .eq('id', authenticatedUser.id ?? '')
    .single();

  if (accountError) {
    console.error('Error fetching account:', accountError.message);
  }

  
  const { data: accountMembership, error: accountMembershipError } =
    await client
      .from('accounts_memberships')
      .select()
      .eq('user_id', accountData?.id ?? '')
      .single();

  if (accountMembershipError) {
    console.error(
      'Error fetching account membership:',
      accountMembershipError.message,
    );
  }
  const { data: accountRole, error: accountRoleError } = await client
    .from('roles')
    .select()
    .eq('name', accountMembership?.account_role ?? '')
    .single();

  if (accountRoleError) {
    console.error('Error fetching account role:', accountRoleError.message);
  }

  const { data: userPermissions, error: userPermissionsError } = await client
    .from('role_permissions')
    .select()
    .eq('role', accountRole?.name ?? '');

  if (userPermissionsError) {
    console.error(
      'Error fetching user permissions:',
      userPermissionsError.message,
    );
  }

  const account = {
    ...accountData,
    permissions: userPermissions?.map((permission) => permission.permission),
    role_hierarchy_level: accountRole?.hierarchy_level,
  };

  const slug = organization?.slug ?? '';

  const [members, invitations, _, { user }] =
    await loadMembersPageData(client, slug).catch((error) => {
      console.error('Error loading members page data:', error);
      return [];
    });

  const canManageRoles =
    account?.permissions?.includes('roles.manage') ?? false;

  const isPrimaryOwner = (await client.rpc('get_session')).data?.organization?.owner_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;

  return (
    <ClientsMembersPagePresentation
      account={{
        id: account.id ?? '',
        role_hierarchy_level: account.role_hierarchy_level ?? 0,
      }}
      currentUserRoleHierarchy={currentUserRoleHierarchy}
      slug={slug}
      members={members}
      invitations={invitations}
      user={user}
      canManageRoles={canManageRoles}
      isPrimaryOwner={isPrimaryOwner}
    />
  );
}

export default withI18n(ClientsMembersPage);
