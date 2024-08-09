import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { If } from '@kit/ui/if';
import { Button } from '@kit/ui/button';
import { loadMembersPageData } from './_lib/server/members-page.loader';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { TeamAccountLayoutPageHeader } from './components/team-account-layout-page-header';

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
    return {
      title: i18n.t('clients:title'),
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
    permissions: Array<'roles.manage' | 'billing.manage' | 'settings.manage' | 'members.manage' | 'invites.manage'>;
};

  async function ClientsMembersPage() {

    const client = getSupabaseServerComponentClient();

    const { data: userData } = await client.auth.getUser();

    const { data } = await client
    .from('accounts')
    .select()
    .eq('primary_owner_user_id', userData.user!.id); 

    const { data: data2} = await client
    .from('accounts_memberships')
    .select()
    .eq('user_id', userData.user!.id); 

    const account_role = data2!.length > 0 ? data2![0]?.account_role : null;

    const { data: data3} = await client
    .from('role_permissions')
    .select('permission')
    .eq('role', account_role!); 

    const userPermissions = data3!.map(permission => permission.permission);
    
    const { data: data4} = await client
    .from('roles')
    .select('hierarchy_level')
    .eq('name', account_role!);

    const roleHierarchies = data4!.map(roleHierarchy => roleHierarchy.hierarchy_level);
    const roleHierarchyLevel = roleHierarchies.length > 0 ? roleHierarchies[0] : 0;

    const filteredData = data ? data.filter(item => item.id !== userData.user!.id) : [];

    const accountData = filteredData.length > 0 ? filteredData[0] : {};

    const account = {
        ...(accountData as Account),
        permissions: userPermissions,
        role_hierarchy_level: roleHierarchyLevel,
    };

    const slug = account.slug;
    

    const [members, invitations, canAddMember, { user }] =
        await loadMembersPageData(client, slug);

  
    const canManageRoles = account.permissions.includes('roles.manage');
    const canManageInvitations = account.permissions.includes('invites.manage');
  
    const isPrimaryOwner = account.primary_owner_user_id === user.id;
    const currentUserRoleHierarchy = account.role_hierarchy_level;

    return (
      <>
        <TeamAccountLayoutPageHeader
          title={<Trans i18nKey={'common:teamsTabLabel'} />}
          account={account.slug}
        />
  
        <PageBody>
          <div className={'flex w-full max-w-4xl flex-col space-y-6 pb-32'}>
            <Card>
              <CardHeader className={'flex flex-row justify-between'}>
                <div className={'flex flex-col space-y-1.5'}>
                  <CardTitle>
                    <Trans i18nKey={'common:membersTabLabel'} />
                  </CardTitle>
                </div>
  
                <If condition={canManageInvitations && canAddMember}>
                  <InviteMembersDialogContainer
                    userRoleHierarchy={currentUserRoleHierarchy ?? 0}
                    accountSlug={account.slug}
                  >
                    <Button size={'sm'} data-test={'invite-members-form-trigger'}>
                      <span>
                        <Trans i18nKey={'teams:inviteMembersButton'} />
                      </span>
                    </Button>
                  </InviteMembersDialogContainer>
                </If>
              </CardHeader>
  
              <CardContent>
                <AccountMembersTable
                  userRoleHierarchy={currentUserRoleHierarchy ?? 0}
                  currentUserId={user.id}
                  currentAccountId={account.id}
                  members={members}
                  isPrimaryOwner={isPrimaryOwner}
                  canManageRoles={canManageRoles}
                />
              </CardContent>
            </Card>
  
            <Card>
              <CardHeader className={'flex flex-row justify-between'}>
                <div className={'flex flex-col space-y-1.5'}>
                  <CardTitle>
                    <Trans i18nKey={'teams:pendingInvitesHeading'} />
                  </CardTitle>
  
                  <CardDescription>
                    <Trans i18nKey={'teams:pendingInvitesDescription'} />
                  </CardDescription>
                </div>
              </CardHeader>
  
              <CardContent>
                <AccountInvitationsTable
                  permissions={{
                    canUpdateInvitation: canManageRoles,
                    canRemoveInvitation: canManageRoles,
                    currentUserRoleHierarchy: currentUserRoleHierarchy ?? 0,
                  }}
                  invitations={invitations}
                />
              </CardContent>
            </Card>
          </div>
        </PageBody>
      </>
    );
  }
  
  export default withI18n(ClientsMembersPage);