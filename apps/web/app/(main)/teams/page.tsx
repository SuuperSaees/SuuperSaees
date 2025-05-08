
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { Button } from '@kit/ui/button';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { loadMembersPageData } from './_lib/server/members-page.loader';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  return {
    title: i18n.t('team:team'),
  };
};


async function ClientsMembersPage() {
  const client = getSupabaseServerComponentClient();

  const { data: authenticatedUser, error: authenticatedUserError } =
    await client.auth.getUser();
  if (authenticatedUserError) {
    console.error(
      'Error fetching authenticated user:',
      authenticatedUserError.message,
    );
  }

  const { data: accountData, error: accountError } = await client
    .from('accounts')
    .select()
    .eq('id', authenticatedUser.user?.id ?? '')
    .single();

  if (accountError) {
    console.error('Error fetching account:', accountError.message);
  }

  const { data: organizationAccount, error: organizationAccountError } =
    await client
      .from('accounts')
      .select()
      .eq('id', accountData?.organization_id ?? '')
      .single();

  if (organizationAccountError) {
    console.error(
      'Error fetching organization account:',
      organizationAccountError.message,
    );
  }
  const { data: accountMembership, error: accountMembershipError } =
    await client
      .from('accounts_memberships')
      .select()
      .eq('account_id', accountData?.id ?? '')
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

  const slug = organizationAccount?.slug ?? '';

  const [members, invitations, canAddMember, { user }] =
    await loadMembersPageData(client, slug);

  const canManageRoles =
    account?.permissions?.includes('roles.manage') ?? false;
  const canManageInvitations =
    account?.permissions?.includes('invites.manage') ?? false;

  const isPrimaryOwner = account.primary_owner_user_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;

  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                  <Trans i18nKey={'team:team'} />
                </div>
              </span>
            </div>
          </div>

          <div className="w-full">
            <div className="flex items-center justify-between py-4">
              <If condition={canManageInvitations && (await canAddMember())}>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold">
                    <Trans i18nKey={'common:membersTabLabel'} />
                  </h3>
                  {members && (
                    <div className="rounded-full border border-brand-700 bg-brand-50 px-2 py-0 text-black-700">
                      <span className="inline-flex gap-2 text-[12px]">
                        <span>{members.length}</span>
                        <Trans i18nKey={'team:labelNumberOfUsers'} />
                      </span>
                    </div>
                  )}
                </div>

                <InviteMembersDialogContainer
                  userRoleHierarchy={currentUserRoleHierarchy ?? 0}
                  accountSlug={slug}
                >
                  <Button size={'sm'} data-test={'invite-members-form-trigger'}>
                    <span>
                      <Trans i18nKey={'team:inviteMembersButton'} />
                    </span>
                  </Button>
                </InviteMembersDialogContainer>
              </If>
            </div>
          </div>

          <Separator />
          <div className="mt-4">
            <AccountMembersTable
              userRoleHierarchy={currentUserRoleHierarchy ?? 0}
              currentUserId={user.id}
              currentAccountId={account.id ?? ''}
              members={members}
              isPrimaryOwner={isPrimaryOwner}
              canManageRoles={canManageRoles}
            />
          </div>

          <div className="mt-12">
            <AccountInvitationsTable
              permissions={{
                canUpdateInvitation: canManageRoles,
                canRemoveInvitation: canManageRoles,
                currentUserRoleHierarchy: currentUserRoleHierarchy ?? 0,
              }}
              invitations={invitations}
            />
          </div>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(ClientsMembersPage);