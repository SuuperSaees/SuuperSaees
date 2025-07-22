

import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { AccountInvitationsTable } from 'node_modules/@kit/team-accounts/src/components/invitations/account-invitations-table';
import { AccountMembersTable } from 'node_modules/@kit/team-accounts/src/components/members/account-members-table';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { InviteMembersDialogContainer } from '@kit/team-accounts/components';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { PageHeader } from '~/(main)/../components/page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { getSession } from '~/server/actions/accounts/accounts.action';

import { loadUserWorkspace } from '../home/(user)/_lib/server/load-user-workspace';
import { loadMembersPageData } from './_lib/server/members-page.loader';

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

  const [members, invitations, _, { user }] = await loadMembersPageData(
    client,
    slug,
    organization?.id ?? '',
    {
      pagination: {
        page: 1,
        limit: 100
      },
    },
    {
      pagination: {
        page: 1,
        limit: 100
      },
    }
  ).catch((error) => {
    console.error('Error loading members page data:', error);
    return [];
  });

  const canManageRoles =
    account?.permissions?.includes('roles.manage') ?? false;

  const isPrimaryOwner =
    (await getSession())?.organization?.owner_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;

  return (
    <PageBody>
      <div className="flex items-center gap-2">
        <PageHeader
          title="team:team"
          className="w-full"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-inter text-xl font-medium leading-4">
              <Trans i18nKey={'team:team'} />
            </h2>

            {members?.data && (
              <div className="flex items-center rounded-full border border-gray-500 bg-gray-50 px-2 text-gray-500">
                <span className="inline-flex gap-2 text-[12px]">
                  <span>{members?.data.length}</span>
                  {members?.data.length === 1 ? (
                    <Trans i18nKey={'team:labelNumberOfUsers.singular'} />
                  ) : (
                    <Trans i18nKey={'team:labelNumberOfUsers.plural'} />
                  )}
                </span>
              </div>
            )}
          </div>
        </PageHeader>
        <InviteMembersDialogContainer
          userRoleHierarchy={currentUserRoleHierarchy ?? 0}
          accountSlug={slug}
          queryKey={"invitations"}
        >
          <ThemedButton
            data-test={'invite-members-form-trigger'}
            className="ml-auto"
            aria-label={'Invite members'}
          >
            <PlusIcon className="h-4 w-4" />
            <span className="hidden md:inline">
              <Trans i18nKey={'team:inviteMembersButton'} />
            </span>
          </ThemedButton>
        </InviteMembersDialogContainer>
      </div>

      <AccountMembersTable
        organizationId={organization?.id ?? ''}
        userRoleHierarchy={currentUserRoleHierarchy ?? 0}
        currentUserId={user.id}
        currentAccountId={account.id ?? ''}
        initialData={members}
        isPrimaryOwner={isPrimaryOwner}
        canManageRoles={canManageRoles}
      />

      <AccountInvitationsTable
        permissions={{
          canUpdateInvitation: canManageRoles,
          canRemoveInvitation: canManageRoles,
          currentUserRoleHierarchy: currentUserRoleHierarchy ?? 0,
        }}
        initialData={invitations}
        organizationId={organization?.id ?? ''}
      />
    </PageBody>
  );
}

export default withI18n(ClientsMembersPage);
