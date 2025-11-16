'use client';

import {
  useMemo,
  useState,
  useEffect,
} from 'react';

import { ColumnDef } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { DataTable } from '@kit/ui/data-table';
import { If } from '@kit/ui/if';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Spinner } from '@kit/ui/spinner';

import { loadPaginatedAccountMembers, Member } from '../../../../../../apps/web/app/(main)/team/_lib/server/members-page.loader';
import { useTableConfigs } from '../../../../../../apps/web/app/(views)/hooks/use-table-configs';
import { useDataPagination } from '../../../../../../apps/web/app/hooks/use-data-pagination';
import { Pagination } from '../../../../../../apps/web/lib/pagination';
import AgencyClientCrudMenu from '../clients/agency-client-crud-menu';
import { RoleBadge } from './role-badge';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { ApproveAgencyMemberButton } from './approve-agency-member-button';

type Members =
  Database['public']['Functions']['get_account_members']['Returns'];

interface Permissions {
  canUpdateRole: () => boolean;
  canRemoveFromAccount: () => boolean;
  canTransferOwnership: boolean;
}

type AccountMembersTableProps = {
  initialData: Pagination.Response<Members>;
  currentUserId: string;
  currentAccountId: string;
  userRoleHierarchy: number;
  organizationId: string;
};

export function AccountMembersTable({
  initialData,
  currentUserId,
  currentAccountId,
  userRoleHierarchy,
  organizationId,
}: AccountMembersTableProps) {

  
  const { workspace: userWorkspace } = useUserWorkspace();
  const userRole = userWorkspace?.role ?? '';
  
  const { config } = useTableConfigs('table-config');

  const {
    data: membersData,
    isLoading: briefsAreLoading,
    pagination,
  } = useDataPagination<Member>({
    queryKey: ['members'],
    queryFn: ({ page, limit }) =>
      loadPaginatedAccountMembers(organizationId, {
        pagination: { page, limit },
      }),
    initialData,
    config: {
      limit: config.rowsPerPage.value,
    },
  });

  const members: Member[] = Array.isArray(membersData) ? membersData : [];

  const permissions = {
    canUpdateRole: () => {
      return (
        userRole === 'agency_project_manager' || userRole === 'agency_owner'
      );
    },
    canRemoveFromAccount: () => {
      return (
        userRole === 'agency_project_manager' || userRole === 'agency_owner'
      );
    },
    canTransferOwnership:
      userRole === 'agency_project_manager' || userRole === 'agency_owner',
  };

  const columns = useGetColumns(
    permissions,
    {
      currentUserId,
      currentAccountId,
      currentRoleHierarchy: userRoleHierarchy,
    },
    false,
    userRole ?? '',
  );


  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: briefsAreLoading,
    },
  };
  return (
    <div className={'flex flex-col space-y-2'}>
      <div className="rounded-lg bg-white">
        <DataTable
          columns={columns}
          data={members}
          configs={extendedConfig}
        />
      </div>
    </div>
  );
}

function useGetColumns(
  permissions: Permissions,
  params: {
    currentUserId: string;
    currentAccountId: string;
    currentRoleHierarchy: number;
  },
  isLoading: boolean,
  userRole: string,
): ColumnDef<Member>[] {
  const { t } = useTranslation('team');
  const [currentDomain, setCurrentDomain] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentDomain(window.location.host);
    }
  }, []);

  return useMemo(
    () => [
      {
        header: t('memberName'),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;
          const memberSettings = member.settings as { name?: string; picture_url?: string } | undefined;
          const displayName =
            memberSettings?.name ?? member.name ?? member.email?.split('@')[0] ?? '';
          const isSelf = member.user_id === params.currentUserId;
          
          // Check if member is not approved - check all domains in public_data
          const publicData = member.public_data || {};
          const isNotApproved = Object.values(publicData).some(
            (domainData: unknown) => {
              const data = domainData as Record<string, unknown>;
              return data?.approved === false;
            }
          );

          return (
            <div className={`flex items-center space-x-4 text-left font-semibold ${
              isNotApproved ? 'opacity-50' : ''
            }`}>
              <span>
                <ProfileAvatar
                  displayName={displayName}
                  pictureUrl={
                    memberSettings?.picture_url ?? member?.picture_url ?? ''
                  }
                />
              </span>

              <span>{displayName}</span>

              <If condition={isSelf}>
                <Badge variant={'outline'}>{t('youLabel')}</Badge>
              </If>
              
              <If condition={isNotApproved}>
                <Badge variant={'secondary'} className="text-xs">
                  {t('pendingApproval')}
                </Badge>
              </If>
            </div>
          );
        },
      },
      {
        header: t('roleLabel'),
        cell: ({ row }) => {
          const { role, owner_user_id, user_id } = row.original;
          const isPrimaryOwner = owner_user_id === user_id;

          return (
            <span className={'flex items-center space-x-1'}>
              <RoleBadge role={role} />

              <If condition={isPrimaryOwner}>
                <span
                  className={
                    'rounded-md bg-yellow-400 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-600'
                  }
                >
                  {t('primaryOwnerLabel')}
                </span>
              </If>
            </span>
          );
        },
      },
      {
        header: t('emailLabel'),
        accessorKey: 'email',
        cell: ({ row }) => {
          return (
            <span className="text-gray-600">{row.original.email ?? '-'}</span>
          );
        },
      },
      {
        header: t('joinedAtLabel'),
        cell: ({ row }) => {
          return (
            <span className="text-gray-600">
              {new Date(row.original.created_at).toLocaleDateString()}
            </span>
          );
        },
      },
      {
        header: '',
        id: 'actions',
        cell: ({ row }) => {
          const member = row.original;
          const publicData = member.public_data || {};
          const currentDomainData = publicData[currentDomain] as Record<string, unknown> | undefined;
          const needsApprovalForCurrentDomain = currentDomainData?.approved === false;
          
          return isLoading ? (
            <Spinner className="h-4" />
          ) : (
            <div className="flex items-center justify-end space-x-2">
              {needsApprovalForCurrentDomain && 
               currentDomain && // Only show if domain is available (after hydration)
               (userRole === 'agency_owner' || userRole === 'agency_project_manager') && (
                <ApproveAgencyMemberButton
                  userId={member.user_id}
                  memberName={member.name}
                  memberEmail={member.email}
                  domain={currentDomain}
                />
              )}
              <ActionsDropdown
                permissions={permissions}
                member={member}
                currentUserId={params.currentUserId}
                currentTeamAccountId={params.currentAccountId}
                currentRoleHierarchy={params.currentRoleHierarchy}
                currentUserRole={userRole}
              />
            </div>
          );
        },
      },
    ],
    [t, params, permissions, isLoading, userRole, currentDomain],
  );
}

function ActionsDropdown({
  permissions,
  member,
  currentUserId,
  currentUserRole,
}: {
  permissions: Permissions;
  member: Member;
  currentUserId: string;
  currentTeamAccountId: string;
  currentRoleHierarchy: number;
  currentUserRole: string;
}) {
  const canUpdateRole = permissions.canUpdateRole();

  const canRemoveFromAccount = permissions.canRemoveFromAccount();

  // if has no permission to update role, transfer ownership or remove from account
  // do not render the dropdown menu

  if (
    !canUpdateRole &&
    !permissions.canTransferOwnership &&
    !canRemoveFromAccount
  ) {
    return null;
  }

  return (
    <>
      <AgencyClientCrudMenu
        userId={member.id}
        name={member.name}
        email={member.email ?? ''}
        currentUserRole={currentUserRole}
        currentUserId={currentUserId}
        inTeamMembers={true}
        targetRole={member.role}
        queryKey="members"
      />
    </>
  );
}
