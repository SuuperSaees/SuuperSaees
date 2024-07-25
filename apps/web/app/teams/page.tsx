import { PageBody } from '@kit/ui/page';
import { PlusCircle } from 'lucide-react';
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


interface Params {
    params: {
      account: "{id: '5deaa894-2094-4da3-b4fd-1fada0809d1c', name: 'Makerkit',picture_url: null,slug: 'makerkit',role: 'owner',role_hierarchy_level: 1,primary_owner_user_id: '31a03e74-1639-45b6-bfa7-77447f1a4762',subscription_status: null,permissions: ['roles.manage','billing.manage','settings.manage','members.manage','invites.manage']}";
    };
  }

  export const generateMetadata = async () => {
    const i18n = await createI18nServerInstance();
    const title = i18n.t('teams:members.pageTitle');
  
    return {
      title,
    };
  };
  
  async function TeamAccountMembersPage({ params }: Params) {
    const client = getSupabaseServerComponentClient();
  
    
  
    // Asigna directamente el objeto account
    const account = {
      id: '5deaa894-2094-4da3-b4fd-1fada0809d1c',
      name: 'Makerkit',
      picture_url: null,
      slug: 'makerkit',
      role: 'owner',
      role_hierarchy_level: 1,
      primary_owner_user_id: '31a03e74-1639-45b6-bfa7-77447f1a4762',
      subscription_status: null,
      permissions: [
        'roles.manage',
        'billing.manage',
        'settings.manage',
        'members.manage',
        'invites.manage',
      ],
    };

    // const [members, invitations, canAddMember, { user }] =
    //   await loadMembersPageData(client, account);
    const [members, invitations, canAddMember, { user }] =
        await loadMembersPageData(client, account.slug);
  
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
                    userRoleHierarchy={currentUserRoleHierarchy}
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
                  userRoleHierarchy={currentUserRoleHierarchy}
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
                    currentUserRoleHierarchy,
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
  
  export default withI18n(TeamAccountMembersPage);