'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';



import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import DeleteUserDialog from 'node_modules/@kit/team-accounts/src/server/actions/clients/delete/delete-client';
import { useTranslation } from 'react-i18next';



import { DataTable } from '@kit/ui/data-table';
// import { Badge } from '@kit/ui/badge';
// import { If } from '@kit/ui/if';
import { ProfileAvatar } from '@kit/ui/profile-avatar';

import { Account } from '~/lib/account.types';

type Members = Pick<
  Account.Type,
  | 'created_at'
  | 'email'
  | 'id'
  | 'is_personal_account'
  | 'name'
  | 'organization_id'
  | 'picture_url'
> & {
  client_organization?: string;
};

interface Permissions {
  canRemoveFromAccount: (roleHierarchy: number) => boolean;
}

type AccountMembersTableProps = {
  members: Members[];
  currentUserId: string;
  currentAccountId: string;
  userRoleHierarchy: number;
  isPrimaryOwner: boolean;
  canManageRoles: boolean;
  searchController?: {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
  };
  addRowController?: {
    onAddRow: () => void;
  };
};
function useGetColumns(
  permissions: Permissions,
  params: {
    currentUserId: string;
    currentAccountId: string;
    currentRoleHierarchy: number;
  },
): ColumnDef<Members[][0]>[] {
  const { t } = useTranslation('clients');

  return useMemo(
    () => [
      {
        header: t('memberName'),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;

          const displayName =
            member.name ?? (member.email ? member?.email.split('@')[0] : '');
          // const isSelf = member.user_id === params.currentUserId;

          return (
            <span className={'flex items-center space-x-4 text-left'}>
              <span>
                <ProfileAvatar
                  displayName={displayName}
                  pictureUrl={member.picture_url}
                />
              </span>

              <span>{displayName}</span>
              {/* 
              <If condition={isSelf}>
                <Badge variant={'outline'}>{t('youLabel')}</Badge>
              </If> */}
            </span>
          );
        },
      },

      {
        header: t('emailLabel'),
        accessorKey: 'email',
        cell: ({ row }) => {
          return row.original.email ?? '-';
        },
      },
      {
        header: t('joinedAtLabel'),
        cell: ({ row }) => {
          const { created_at } = row.original;
          return created_at ? new Date(created_at).toLocaleDateString() : null;
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        enableHiding: false,
        cell: ({ row }) => {
          const client = row.original;

          return (
            <div className="h-18 flex items-center gap-4 self-stretch p-4">
              {/* <UpdateClientDialog {...client} /> */}
              <DeleteUserDialog userId={client.id} />
            </div>
          );
        },
      },
    ],
    [t, params],
  );
}

export function ClientsTable({
  members,
  currentUserId,
  currentAccountId,
  isPrimaryOwner,
  userRoleHierarchy,
  canManageRoles,
  searchController,
  addRowController,
}: AccountMembersTableProps) {
  const [search, setSearch] = useState(searchController?.search ?? '');
  const { t } = useTranslation('clients');

  const permissions = {
    canRemoveFromAccount: (targetRole: number) => {
      return (
        isPrimaryOwner || (canManageRoles && userRoleHierarchy < targetRole)
      );
    },
  };

  const filteredMembers = members.filter((member) => {
    const searchString = search?.toLowerCase();
    const displayName = member?.name ?? member?.email?.split('@')[0] ?? '';

    return displayName.includes(searchString);
  });

  useEffect(() => {
    if (searchController) {
      setSearch(searchController.search);
    }
  }, [searchController]);
  const columns = useGetColumns(permissions, {
    currentUserId,
    currentAccountId,
    currentRoleHierarchy: userRoleHierarchy,
  });
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        {!searchController && (
          <div className="relative ml-auto flex w-fit flex-1 md:grow-0">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={t(`organizations.members.invite.search`)}
              className="w-full rounded-lg bg-background pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
        )}
        {addRowController && (
          <ThemedButton onClick={addRowController.onAddRow}>
            {t(`organizations.members.invite.add`)}
          </ThemedButton>
        )}
      </div>
      <DataTable columns={columns} data={filteredMembers} />
    </div>
  );
}