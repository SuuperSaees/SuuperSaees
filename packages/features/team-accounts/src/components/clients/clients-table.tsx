'use client';

import { useMemo, useState } from 'react';
import * as React from 'react';

import Link from 'next/link';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  TableOptions,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Separator } from '@kit/ui/separator';

import EmptyState from '../../../../../../apps/web/components/ui/empty-state';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import CreateClientDialog from '../../../../../../packages/features/team-accounts/src/server/actions/clients/create/create-client';
import DeleteUserDialog from '../../../../../../packages/features/team-accounts/src/server/actions/clients/delete/delete-client';
import { ThemedInput } from '../../../../accounts/src/components/ui/input-themed-with-settings';
import { ClientsWithOrganization } from '../../server/actions/clients/get/get-clients';
import { Account } from '../../../../../../apps/web/lib/account.types';

// import UpdateClientDialog from '../../server/actions/clients/update/update-client';

const getUniqueOrganizations = (clients: ClientsWithOrganization[]): Organization[] => {
  return clients.map((client) => ({
    ...client.organization,
    primary_owner: client.primaryOwner?.name ?? '',
  }));
};

const getUniqueClients = (clients: ClientsWithOrganization[]): Client[] => {
  return clients.flatMap((client) =>
    client.users.map((user) => ({
      ...user,
      primary_owner: client.primaryOwner?.name ?? '',
      organization: {
        id: client.organization.id,
        name: client.organization.name,
      },
    }))
  );
};
// organization type based on getUniqueOrganizations

type Organization = Pick<
  Account.Type,
  | 'id'
  | 'name'
  | 'slug'
  | 'picture_url'
  | 'created_at'
  | 'is_personal_account'
  | 'primary_owner_user_id'
> & {
  primary_owner: string;
};

type Client = Pick<
  Account.Type,
  | 'id'
  | 'name'
  | 'email'
  | 'created_at'
  | 'is_personal_account'
  | 'organization_id'
  | 'picture_url'
  | 'primary_owner_user_id'
> & {
  primary_owner: string;
  organization: {
    id: string;
    name: string;
  };
};

type ClientsTableProps = {
  clients: ClientsWithOrganization[];
  accountIds: string[];
  accountNames: string[];
  view?: 'clients' | 'organizations';
};

// CLIENTS TABLE
// accountIds, accountNames
export function ClientsTable({ clients, view }: ClientsTableProps) {
  const { t } = useTranslation();
  const [activeButton, setActiveButton] = useState<'clients' | 'organizations'>(
    'clients',
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [search, setSearch] = React.useState('');
  const uniqueClients = useMemo(
    () => getUniqueClients(clients),
    [clients],
  );
  const uniqueOrganizations = useMemo(
    () => getUniqueOrganizations(clients),
    [clients],
  );
  const organizationColumns = useOrganizationColumns(t);
  const clientColumns = useClientColumns(t);
  const columns =
    activeButton === 'clients' ? clientColumns : organizationColumns;

  const filteredClients = uniqueClients.filter((client) => {
    const searchString = search?.toLowerCase();
    const displayName = client?.name.toLowerCase();
    return displayName.includes(searchString);
  });

  const filteredOrganizations = uniqueOrganizations.filter((client) => {
    const searchString = search?.toLowerCase();
    const displayName = client?.name.toLowerCase();
    return displayName.includes(searchString);
  });
  const options = {
    data:
      activeButton === 'organizations'
        ? filteredOrganizations
        : filteredClients,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  };

  // const importantPropietaryOrganization = accountNames[0];
  // const importantPropietaryOrganizationId = accountIds[0];

  const handleButtonClick = (button: 'clients' | 'organizations') => {
    setActiveButton(button);
  };

  React.useEffect(() => {
    if (view) {
      setActiveButton(view);
      handleButtonClick(view);
    }
  }, [view]);

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-[24px]">
        <div className="flex">
          {!view && (
            <>
              <Button
                variant="ghost"
                className={`flex h-9 items-center gap-2 rounded-md p-2 px-3 ${activeButton === 'clients' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'}`}
                onClick={() => handleButtonClick('clients')}
              >
                <span className="text-sm font-semibold leading-5">
                  {t('clients:clients')}
                </span>
              </Button>
              <Button
                variant="ghost"
                className={`ml-[20px] flex h-9 items-center gap-2 rounded-md p-2 px-3 ${activeButton === 'organizations' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'}`}
                onClick={() => handleButtonClick('organizations')}
              >
                <span className="text-sm font-semibold leading-5">
                  {t('clients:organizations.title')}
                </span>
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-4 px-2">
          <div className="relative ml-auto flex w-fit flex-1 md:grow-0">
            <Search className="text-muted-foreground absolute right-2.5 top-2.5 h-4 w-4" />

            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={
                activeButton === 'clients'
                  ? t('clients:searchClients')
                  : t('clients:searchOrganizations')
              }
              className="bg-background w-full rounded-lg pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          {(activeButton === 'organizations' &&
            filteredOrganizations.length > 0) ||
            (filteredClients.length > 0 && <CreateClientDialog />)}
        </div>
        {!view && <Separator />}
      </div>
      {(activeButton === 'organizations' && !uniqueClients.length) ||
      !clients.length ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t('startWithFirstClientTitle')}
          description={t('noClientsDescription')}
          button={<CreateClientDialog />}
        />
      ) : (
        <DataTable
          data={
            (activeButton === 'organizations'
              ? filteredOrganizations
              : filteredClients) as Client[]
          }
          columns={columns as ColumnDef<Client>[]}
          options={options as TableOptions<Client>}
        />
      )}
    </div>
  );
}

const useClientColumns = (
  t: TFunction<'clients', undefined>,
): ColumnDef<Client>[] => {
  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('clientName'),
        cell: ({ row }) => (
          <Link
            href={`clients/organizations/${row.original.organization.id}`}
            className={'flex items-center space-x-4 text-left'}
          >
            <span>
              <ProfileAvatar
                displayName={row.original.name}
                pictureUrl={row.original.picture_url}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-[1.42857] text-gray-900">
                {row.original.name}
              </span>
              <span className="text-sm font-normal leading-[1.42857] text-gray-600">
                {row.original.email}
              </span>
            </div>
          </Link>
        ),
      },
      // {
      //   accessorKey: "role",
      //   header: t("role"),
      //   cell: ({ row }) => {
      //     // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      //     const role = row.getValue("role") as string;
      //     return (
      //       <div className="capitalize">
      //         {role === 'leader' ? t('leader') : role === 'member' ? t('member') : role}
      //       </div>
      //     );
      //   },
      // },
      {
        accessorKey: 'client_organization',
        header: t('organization'),
        cell: ({ row }) => (
          <Link
            href={`clients/organizations/${row.original.organization.id}`}
            className="capitalize"
          >
            {row.original.organization.name}
          </Link>
        ),
      },
      {
        accessorKey: 'last_login',
        header: ({ column }) => {
          return (
            <div>
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
              >
                <div className="flex items-center justify-between">
                  <span>{t('lastLogin')}</span>
                  <ArrowDown className="ml-2 h-4 w-4" />
                </div>
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at ?? '');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return (
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
          );
        },
      },
      {
        accessorKey: 'created_at_column',
        header: ({ column }) => {
          return (
            <div>
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
              >
                <div className="flex items-center justify-between">
                  <span>{t('createdAt')}</span>
                  <ArrowUp className="ml-2 h-4 w-4" />
                </div>
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at ?? '');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return (
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
          );
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
    [t],
  );
};

{/* // ORGANIZATIONS TABLE */}
const useOrganizationColumns = (
  t: TFunction<'clients', undefined>,
): ColumnDef<Organization>[] => {
  return useMemo(
    () => [
      {
        accessorKey: 'client_organization',
        header: t('organizationName'),
        cell: ({ row }) => (
          <Link
            href={`clients/organizations/${row.original.id}`}
            className={'flex items-center space-x-4 text-left'}
          >
            <span>
              <ProfileAvatar
                displayName={row.original.name}
                pictureUrl={row.original.picture_url}
              />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-[1.42857] text-gray-900">
                {row.original.name}
              </span>
              <span className="text-sm font-normal leading-[1.42857] text-gray-600">
                {t('leader')}: {row.original.primary_owner}
              </span>
            </div>
          </Link>
        ),
      },
      {
        accessorKey: 'members',
        header: t('organizationMembers'),
        cell: ({ row }) => (
          <div className="flex">
            <ProfileAvatar
              displayName={row.original.name}
              pictureUrl={row.original.picture_url}
            />
          </div>
        ),
      },
      {
        accessorKey: 'created_at_organization',
        header: ({ column }) => (
          <div>
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === 'asc')
              }
            >
              <div className="flex items-center justify-between">
                <span>{t('createdAt')}</span>
                <ArrowUp className="ml-2 h-4 w-4" />
              </div>
            </Button>
          </div>
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.created_at ?? '');
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return (
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        enableHiding: false,
        cell: ({row}) => {
          return (
            <div className="h-18 flex items-center gap-4 self-stretch p-4">
              {/* <Pen className="h-4 w-4 text-gray-600" /> */}
              <DeleteUserDialog userId={''}  organizationId={row.original.id} />
            </div>
          );
        },
      },
    ],
    [t],
  );
};
