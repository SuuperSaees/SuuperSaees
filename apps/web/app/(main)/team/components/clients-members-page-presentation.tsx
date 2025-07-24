'use client';

import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { If } from '@kit/ui/if';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { PageHeader } from '../../../components/page-header';

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
    organization_id: string;
    role: string;
    role_hierarchy_level: number;
    owner_user_id: string;
    name: string;
    email: string;
    picture_url: string;
    created_at: string;
    updated_at: string;
    settings?: {
      name: string | null;
      picture_url: string | null;
    };
  }[];
  invitations: {
    id: number;
    email: string;
    organization_id: string;
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
  const { workspace } = useUserWorkspace();
  const currentRole = workspace?.role;

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

            {members && (
              <div className="flex items-center rounded-full border border-gray-500 bg-gray-50 px-2 text-gray-500">
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
        </PageHeader>
        <InviteMembersDialogContainer
          userRoleHierarchy={currentUserRoleHierarchy ?? 0}
          accountSlug={slug}
        >
          <ThemedButton
            data-test={'invite-members-form-trigger'}
            className="ml-auto"
          >
            <PlusIcon className="h-4 w-4" />

            <Trans i18nKey={'team:inviteMembersButton'} />
          </ThemedButton>
        </InviteMembersDialogContainer>
      </div>

      {/* Temporary fix with user roles while error 500 issue is solved */}
      <If
        condition={
          currentRole === 'agency_owner' ||
          currentRole === 'agency_project_manager' ||
          currentRole === 'super_admin'
        }
      >
        {/* )} */}
      </If>

      <AccountMembersTable
        userRoleHierarchy={currentUserRoleHierarchy ?? 0}
        currentUserId={user.id}
        currentAccountId={account.id ?? ''}
        members={members}
        isPrimaryOwner={isPrimaryOwner}
        canManageRoles={canManageRoles}
      />

      <AccountInvitationsTable
        permissions={{
          canUpdateInvitation: canManageRoles,
          canRemoveInvitation: canManageRoles,
          currentUserRoleHierarchy: currentUserRoleHierarchy ?? 0,
        }}
        invitations={invitations}
      />
    </PageBody>
  );
};

export default ClientsMembersPagePresentation;
