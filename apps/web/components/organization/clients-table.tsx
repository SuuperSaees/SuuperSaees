'use client';

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';



import { ColumnDef } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';



import { DataTable } from '@kit/ui/data-table';
// import { Badge } from '@kit/ui/badge';
// import { If } from '@kit/ui/if';
import { ProfileAvatar } from '@kit/ui/profile-avatar';



import { Account } from '~/lib/account.types';
import AgencyClientCrudMenu from '~/team-accounts/src/components/clients/agency-client-crud-menu';


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
  role: string | null;
  settings?: {
    name?: string;
    picture_url?: string;
  };
};

interface Permissions {
  canRemoveFromAccount: (userId: string) => boolean;
  queryKey?: string;
}

function useGetColumns(permissions: Permissions): ColumnDef<Members[][0]>[] {
  const { t } = useTranslation('clients');

  return useMemo(
    () => [
      {
        header: t('memberName'),
        size: 200,
        cell: ({ row }) => {
          const member = row.original;

          const displayName =
            member.settings?.name ?? member.name ?? (member.email ? member?.email.split('@')[0] : '');
          // const isSelf = member.user_id === params.currentUserId;

          return (
            <span className={'flex items-center space-x-4 text-left'}>
              <span>
                <ProfileAvatar
                  displayName={displayName}
                  pictureUrl={member.settings?.picture_url ?? member.picture_url}
                />
              </span>

              <span className="font-semibold">{displayName}</span>
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
          return <span className="text-gray-600">{row.original.email ?? '-'}</span> ;
        },
      },
      {
        header: t('joinedAtLabel'),
        cell: ({ row }) => {
          const { created_at } = row.original;
          return <span className="text-gray-600">{created_at ? new Date(created_at).toLocaleDateString() : null}</span>;
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        enableHiding: false,
        cell: ({ row }) => {
          const client = row.original;
          return (
            permissions.canRemoveFromAccount(row.original.id) && (
              <div className="h-18 flex items-center gap-4 self-stretch p-4">
                {/* <UpdateClientDialog {...client} /> */}
                {/* <DeleteUserDialog
                  userId={client.id}
                  queryKey={permissions.queryKey}
                /> */}
                <AgencyClientCrudMenu userId={client.id} name={client.name} email={client.email ?? ''} queryKey={permissions.queryKey} targetRole={client?.role ?? undefined}/>
              </div>
            )
          );
        },
      },
    ],
    [t, permissions],
  );
}

type AccountMembersTableProps = {
  members: Members[];
  userRole: string;
  searchController?: {
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
  };
  addRowController?: {
    onAddRow: () => void;
  };
  queryKey?: string;
};

export function ClientsTable({
  members,
  userRole,
  searchController,
  addRowController,
  queryKey,
}: AccountMembersTableProps) {
  const [search, setSearch] = useState(searchController?.search ?? '');
  const { t } = useTranslation('clients');
  const validRoles = ['agency_owner', 'client_owner', 'agency_project_manager'];
  const permissions = {
    canRemoveFromAccount: () => {
      return validRoles.includes(userRole);
    },
    queryKey: queryKey,
  };

  const filteredMembers = useMemo(() => members.filter((member) => {
    const searchString = search?.toLowerCase();
    const displayName = member?.name ?? member?.email?.split('@')[0] ?? '';

    return displayName.includes(searchString);
  }), [members, search]);

  useEffect(() => {
    if (searchController) {
      setSearch(searchController.search);
    }
  }, [searchController]);
  const columns = useGetColumns(permissions);
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
      <DataTable columns={columns} data={filteredMembers} className="bg-white" />
    </div>
  );
}