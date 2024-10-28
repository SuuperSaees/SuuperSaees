'use client';

import { useMemo, useState } from 'react';
import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Separator } from '@kit/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { Account } from '../../../../../../apps/web/lib/account.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import CreateClientDialog from '../../../../../../packages/features/team-accounts/src/server/actions/clients/create/create-client';
import DeleteUserDialog from '../../../../../../packages/features/team-accounts/src/server/actions/clients/delete/delete-client';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import { ThemedInput } from '../../../../accounts/src/components/ui/input-themed-with-settings';
import { ClientsWithOrganization } from '../../server/actions/clients/get/get-clients';

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
const clientColumns = (
  t: TFunction<'clients', undefined>,
): ColumnDef<Client>[] => [
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
    accessorKey: 'organization',
    header: t('organization'),
    cell: ({ row }) => (
      <Link
        href={`clients/organizations/${row.original.organization_id}`}
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
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
    accessorKey: 'created_at',
    header: ({ column }) => {
      return (
        <div>
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
];

// ORGANIZATIONS TABLE
const organizationColumns = (
  t: TFunction<'clients', undefined>,
): ColumnDef<Organization>[] => [
  {
    accessorKey: 'name',
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
    accessorKey: 'created_at',
    header: ({ column }) => (
      <div>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
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
    cell: ({ row }) => {
      const client = row.original;
      console.log('client', client);
      return (
        <div className="h-18 flex items-center gap-4 self-stretch p-4">
          {/* <Pen className="h-4 w-4 text-gray-600" /> */}
          <DeleteUserDialog
            organizationId={client.id ?? undefined}
            userId={''}
          />
        </div>
      );
    },
  },
];
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

  const transformedOrganizations = useMemo(
    () => getUniqueOrganizations(clients),
    [clients],
  );
  const transformedClients = useMemo(
    () => getUniqueClients(clients),
    [clients],
  );
  const columns = useMemo<ColumnDef<Organization>[] | ColumnDef<Client>[]>(
    () =>
      activeButton === 'clients' ? clientColumns(t) : organizationColumns(t),
    [t, activeButton],
  );

  console.log('transformedClients', transformedClients);

  const table = useReactTable<Organization | Client>({
    data:
      activeButton === 'organizations'
        ? transformedOrganizations
        : transformedClients,
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
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  // const importantPropietaryOrganization = accountNames[0];
  // const importantPropietaryOrganizationId = accountIds[0];

  const handleButtonClick = (button: 'clients' | 'organizations') => {
    setActiveButton(button);
    if (button === 'clients') {
      table
        .getColumn('name')
        ?.setFilterValue(table.getColumn('name')?.getFilterValue() ?? '');
    } else if (button === 'organizations') {
      table
        .getColumn('client_organization')
        ?.setFilterValue(
          table.getColumn('client_organization')?.getFilterValue() ?? '',
        );
    }
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
          <div className="relative max-w-sm rounded-md bg-white">
            <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] -translate-y-1/2 transform text-gray-500" />
            <ThemedInput
              placeholder={
                activeButton === 'clients'
                  ? t('clients:searchClients')
                  : t('clients:searchOrganizations')
              }
              value={
                activeButton === 'clients'
                  ? ((table.getColumn('name')?.getFilterValue() as string) ??
                    '')
                  : ((table
                      .getColumn('client_organization')
                      ?.getFilterValue() as string) ?? '')
              }
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (activeButton === 'clients') {
                  table.getColumn('name')?.setFilterValue(event.target.value);
                } else {
                  table
                    .getColumn('client_organization')
                    ?.setFilterValue(event.target.value);
                }
              }}
              className="pl-10"
            />
          </div>
          <CreateClientDialog />
        </div>
      </div>
      {!view && <Separator />}
      <div className="mt-[24px] rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex h-[493px] flex-col place-content-center items-center">
                    <Image
                      src="/images/illustrations/Illustration-cloud.svg"
                      alt="Illustration Card"
                      width={220}
                      height={160}
                    />
                    <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                      {t('startWithFirstClientTitle')}
                    </h3>
                    <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                      {t('noClientsDescription')}
                    </p>
                    <CreateClientDialog />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {table.getRowModel().rows?.length ? (
        <>
          <div className="flex items-center justify-between py-4">
            <Pagination>
              <PaginationContent className="flex w-full items-center justify-between">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (table.getCanPreviousPage()) {
                        table.previousPage();
                      }
                    }}
                  />
                </PaginationItem>
                <div className="flex flex-1 justify-center">
                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        isActive={pageIndex === page - 1}
                        onClick={(e) => {
                          e.preventDefault();
                          table.setPageIndex(page - 1);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  {pageCount > 3 && pageIndex < pageCount - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                </div>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (table.getCanNextPage()) {
                        table.nextPage();
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
}
