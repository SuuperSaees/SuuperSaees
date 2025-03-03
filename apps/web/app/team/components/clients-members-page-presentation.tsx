'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { PageHeader } from '../../components/page-header';
import { TimerContainer } from '../../components/timer-container';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

const ClientsMembersPagePresentation = ({
  account,
  currentUserRoleHierarchy,
  slug,
  members,
  invitations,
  user,
  canManageRoles,
  isPrimaryOwner,
}: {
    account: {
      id: string;
      role_hierarchy_level: number;
    };
    currentUserRoleHierarchy: number | undefined;
    slug: string;
    members: {
        id: string;
        user_id: string;
        account_id: string;
        role: string;
        role_hierarchy_level: number;
        primary_owner_user_id: string;
        name: string;
        email: string;
        picture_url: string;
        created_at: string;
        updated_at: string;
        settings?: {
            name: string | null;
            picture_url: string | null;
        }
    }[];
    invitations: {
        id: number;
        email: string;
        account_id: string;
        invited_by: string;
        role: string;
        created_at: string;
        updated_at: string;
        expires_at: string;
        inviter_name: string;
        inviter_email: string;
    }[];
    user: {
      id: string;
    };
    canManageRoles: boolean;
    isPrimaryOwner: boolean;
}) => {
  const {workspace} = useUserWorkspace()
  const currentRole = workspace?.role

  return (
    <PageBody>
      <div className="p-[35px]">
        <PageHeader 
          title='team:team'
          rightContent={
            <TimerContainer />
          }
        />

        <div className="w-full">
          <div className="flex items-center justify-between pb-[28px]">
            {/* Temporary fix with user roles while error 500 issue is solved */}
            <If condition={currentRole === 'agency_owner' || currentRole === 'agency_project_manager' || currentRole === 'super_admin'}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">
                  <Trans i18nKey={'common:membersTabLabel'} />
                </h3>
                {members && (
                  <div className="rounded-full border border-brand-700 bg-brand-50 px-2 py-0 text-brand-700">
                    <span className="inline-flex gap-2 text-[12px]">
                      <span>{members.length}</span>
                      {members.length === 1 ? (
                        <Trans i18nKey={'team:labelNumberOfUsers.singular'} />
                      ) : (
                        <Trans i18nKey={'team:labelNumberOfUsers.plural'} />
                      )}
                    </span>
                  </div>
                )}
              </div>
                  <div
                  >
                    <ThemedButton
                      data-test={'invite-members-form-trigger'}
                      className="p-0"
                    >
                        <InviteMembersDialogContainer
                  userRoleHierarchy={currentUserRoleHierarchy ?? 0}
                  accountSlug={slug}
                >
                    <span className="p-2">
                        <Trans i18nKey={'team:inviteMembersButton'} />
                      </span>
                </InviteMembersDialogContainer>
                      
                    </ThemedButton>
                  </div>
              {/* )} */}
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
  );
};

export default ClientsMembersPagePresentation;