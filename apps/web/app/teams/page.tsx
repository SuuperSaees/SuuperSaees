import { BellIcon } from '@radix-ui/react-icons';

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
    title: i18n.t('teams:team'),
  };
};

type Account = {
  id: string;
  primary_owner_user_id: string;
  name: string;
  slug: string;
  email: string | null;
  is_personal_account: boolean;
  updated_at: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  picture_url: string | null;
  public_data: object;
  role_hierarchy_level: number;
  permissions: Array<
    | 'roles.manage'
    | 'billing.manage'
    | 'settings.manage'
    | 'members.manage'
    | 'invites.manage'
  >;
};

async function ClientsMembersPage() {
  const client = getSupabaseServerComponentClient();

  const { data: userData } = await client.auth.getUser();

  const { data } = await client
    .from('accounts')
    .select()
    .eq('primary_owner_user_id', userData.user!.id);

  const { data: data2 } = await client
    .from('accounts_memberships')
    .select()
    .eq('user_id', userData.user!.id);

  const account_role = data2!.length > 0 ? data2![0]?.account_role : null;

  const { data: data3 } = await client
    .from('role_permissions')
    .select('permission')
    .eq('role', account_role!);

  const userPermissions = data3!.map((permission) => permission.permission);

  const { data: data4 } = await client
    .from('roles')
    .select('hierarchy_level')
    .eq('name', account_role!);

  const roleHierarchies = data4!.map(
    (roleHierarchy) => roleHierarchy.hierarchy_level,
  );
  const roleHierarchyLevel =
    roleHierarchies.length > 0 ? roleHierarchies[0] : 0;

  const filteredData = data
    ? data.filter((item) => item.id !== userData.user!.id)
    : [];

  const accountData = filteredData.length > 0 ? filteredData[0] : {};

  const account = {
    ...(accountData as Account),
    permissions: userPermissions,
    role_hierarchy_level: roleHierarchyLevel,
  };

  const organizationAccount = await client
    .from('accounts')
    .select()
    .eq('id', data?.[0]?.organization_id ?? '')
    .single();

  const slug = organizationAccount.data?.slug ?? '';


  const [members, invitations, canAddMember, { user }] =
    await loadMembersPageData(client, slug);

  const canManageRoles = account.permissions.includes('roles.manage');
  const canManageInvitations = account.permissions.includes('invites.manage');

  const isPrimaryOwner = account.primary_owner_user_id === user.id;
  const currentUserRoleHierarchy = account.role_hierarchy_level;
  console.log('orgnazation account ', organizationAccount, slug);
  return (
    <>
      <PageBody>
        <div className="p-[35px]">
          <div className="mb-[32px] flex items-center justify-between">
            <div className="flex-grow">
              <span>
                <div className="text-primary-900 font-inter text-[36px] font-semibold leading-[44px] tracking-[-0.72px]">
                  <Trans i18nKey={'teams:team'} />
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
                  <div className="rounded-full border border-brand-700 bg-brand-50 px-2 py-0 text-brand-700">
                    <span className="inline-flex gap-2 text-[12px]">
                      <span>{members.length}</span>
                      <Trans i18nKey={'teams:labelNumberOfUsers'} />
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
                      <Trans i18nKey={'teams:inviteMembersButton'} />
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
              currentAccountId={account.id}
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
