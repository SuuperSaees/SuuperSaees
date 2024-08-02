'use client';

import { useMemo, useState } from 'react';
import * as React from "react"
import { ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable, } from '@tanstack/react-table';
import { Button } from '@kit/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kit/ui/table"
import { Input } from '@kit/ui/input';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Search, Pen, ArrowUp, ArrowDown } from 'lucide-react';
import { Separator } from '@kit/ui/separator';
import {
  Pagination,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import DeleteUserDialog from '../../../../../../packages/features/team-accounts/src/server/actions/delete/delete-client';
import CreateClientDialog from '../../../../../../packages/features/team-accounts/src/server/actions/create/create-client';
import UpdateClientDialog from '../../server/actions/update/update-client';
import { useTranslation } from 'react-i18next';


const getUniqueOrganizations = (clients: Client[]) => {
  const organizationMap = new Map<string, Client>();

  clients.forEach(client => {
    if (!organizationMap.has(client.client_organization)) {
      organizationMap.set(client.client_organization, client);
    } else {
      const existingClient = organizationMap.get(client.client_organization);
      if (client.role === 'leader') {
        organizationMap.set(client.client_organization, client);
      }
    }
  });

  return Array.from(organizationMap.values());
};

type ClientsTableProps = {
  clients: {
    id: string;
    created_at: string;
    name: string;
    client_organization: string;
    email: string;
    role: string;
    propietary_organization: string;
    propietary_organization_id: string;
    picture_url: string | null;
  }[];
  accountIds: string[];
  accountNames: string[];

}


type Client = {
  id: string;
  created_at: string;
  name: string;
  client_organization: string;
  email: string;
  role: string;
  propietary_organization: string;
  propietary_organization_id: string;
  picture_url: string | null
}



// CLIENTS TABLE
  const clientColumns = (t: any): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: t('clientName'),
    cell: ({ row }) => (
      <span className={'flex items-center space-x-4 text-left'}>
        <span>
          <ProfileAvatar displayName={row.original.name} pictureUrl={row.original.picture_url} />
        </span>
        <div className='flex flex-col'>
          <span className='text-gray-900 text-sm font-medium leading-[1.42857]'>{row.original.name}</span>
          <span className='text-gray-600 text-sm font-normal leading-[1.42857]'>{row.original.email}</span>
        </div>
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: t("role"),
    cell: ({ row }) => {
      const role = row.getValue("role");
      return (
        <div className="capitalize">
          {role === 'leader' ? t('leader') : role === 'member' ? t('member') : role}
        </div>
      );
    },
  },
  {
    accessorKey: "client_organization",
    header: t("organization"),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("client_organization")}</div>
    ),
  },
  {
    accessorKey: "last_login",
    header: ({ column }) => {
      return (
        <div >
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className='flex justify-between items-center'>
              <span>{t("lastLogin")}</span>
              <ArrowDown className="h-4 w-4 ml-2" />
            </div>
          </Button>
        </div>
        
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
  
      const formattedDate = `${day}-${month}-${year}`;
  
      return (
        <span className="text-gray-900 text-sm font-medium">
          {formattedDate}
        </span>
      );
    },
  },
  {
    accessorKey: "created_at_column",
    header: ({ column }) => {
      return (
        <div >
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className='flex justify-between items-center'>
              <span>{t("createdAt")}</span>
              <ArrowUp className="h-4 w-4 ml-2" />
            </div>
          </Button>
        </div>
        
      )
    },
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
  
      const formattedDate = `${day}-${month}-${year}`;
  
      return (
        <span className="text-gray-900 text-sm font-medium">
          {formattedDate}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original
 
      return (
        <div className='flex h-18 p-4 items-center gap-4 self-stretch'>
          <UpdateClientDialog {...client} />
          <DeleteUserDialog userId={client.id}/>
        </div>
      )
    },
  },
]

// ORGANIZATIONS TABLE
  const organizationColumns = (t: any): ColumnDef<Client>[] => [
  {
    accessorKey: "client_organization",
    header: t("organizationName"),
    cell: ({ row }) => (
      <span className={'flex items-center space-x-4 text-left'}>
        <span>
          <ProfileAvatar displayName={row.original.name} pictureUrl={row.original.picture_url} />
        </span>
        <div className='flex flex-col'>
          <span className='text-gray-900 text-sm font-medium leading-[1.42857]'>{row.original.client_organization}</span>
          <span className='text-gray-600 text-sm font-normal leading-[1.42857]'>
            {t('leader')}: {row.original.name}
          </span>
        </div>
      </span>
    ),
},
  {
    accessorKey: "members",
    header: t("organizationMembers"),
    cell: ({ row }) => (
      <div className='flex'>
        <ProfileAvatar displayName={row.original.name} pictureUrl={row.original.picture_url} />
      </div>
    ),
  },
  {
    accessorKey: "created_at_organization",
    header: ({ column }) => (
      <div>
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          <div className='flex justify-between items-center'>
            <span>{t("createdAt")}</span>
            <ArrowUp className="h-4 w-4 ml-2" />
          </div>
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
  
      const formattedDate = `${day}-${month}-${year}`;
  
      return (
        <span className="text-gray-900 text-sm font-medium">
          {formattedDate}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: t("actions"),
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original;
 
      return (
        <div className='flex h-18 p-4 items-center gap-4 self-stretch'>
          <Pen className="h-4 w-4 text-gray-600" />
        </div>
      );
    },
  },
];

export function ClientsTable({ clients,  accountIds, accountNames  }: ClientsTableProps) {
  const { t } = useTranslation();
  const [activeButton, setActiveButton] = useState<'clientes' | 'organizaciones'>('clientes');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const uniqueClients = useMemo(() => getUniqueOrganizations(clients), [clients]);
  const columns = useMemo<ColumnDef<Client>[]>(() => activeButton === 'clientes' ? clientColumns(t) : organizationColumns(t), [t, activeButton]);
  
  

  const table = useReactTable({
    data: activeButton === 'organizaciones' ? uniqueClients : clients,
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

  const importantPropietaryOrganization = accountNames[0];
  const importantPropietaryOrganizationId = accountIds[0];

  const handleButtonClick = (button: 'clientes' | 'organizaciones') => {
    setActiveButton(button);
    if (button === 'clientes') {
      table.getColumn("name")?.setFilterValue(table.getColumn("name")?.getFilterValue() ?? "");
    } else if (button === 'organizaciones') {
      table.getColumn("client_organization")?.setFilterValue(table.getColumn("client_organization")?.getFilterValue() ?? "");
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-between">
        <div className='flex'>
          <Button
            className={`flex h-9 p-2 px-3 items-center gap-2 rounded-md ${activeButton === 'clientes' ? 'bg-brand-50 text-brand-700' : 'bg-transparent text-gray-500'}`}
            onClick={() => handleButtonClick('clientes')}
          >
            <span className="text-sm font-semibold leading-5">Clientes</span>
          </Button>
          <Button
            variant='ghost'
            className={`flex h-9 p-2 px-3 items-center gap-2 rounded-md ${activeButton === 'organizaciones' ? 'bg-brand-50 text-brand-700' : 'bg-transparent text-gray-500'}`}
            onClick={() => handleButtonClick('organizaciones')}
          >
            <span className="text-sm font-semibold leading-5">Organizaciones</span>
          </Button>
        </div>
        <div className='flex px-2 gap-4'>
          <div className='relative max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-[20px] h-[20px]' />
            <Input
              placeholder={activeButton === 'clientes' ? "Buscar clientes..." : "Buscar organizaciones..."}
              value={
                activeButton === 'clientes'
                  ? (table.getColumn("name")?.getFilterValue() as string) ?? ""
                  : (table.getColumn("client_organization")?.getFilterValue() as string) ?? ""
              }
              onChange={(event) => {
                if (activeButton === 'clientes') {
                  table.getColumn("name")?.setFilterValue(event.target.value);
                } else {
                  table.getColumn("client_organization")?.setFilterValue(event.target.value);
                }
              }}
              className="pl-10"
            />
          </div>
          <CreateClientDialog propietary_organization={importantPropietaryOrganization ?? ''} propietary_organization_id={importantPropietaryOrganizationId ?? ''}/>
        </div>
      </div>
      <Separator />
      <div className="rounded-md border mt-4">
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
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
       <div className="flex items-center justify-between px-2 py-4">
          <div className="flex items-center gap-2">
            <PaginationPrevious
              onClick={() => table.previousPage()}
              isActive={table.getCanPreviousPage()}
            >
              {t('previous')}
            </PaginationPrevious>

            <span className="text-sm font-medium">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>

            <PaginationNext
              onClick={() => {
                if (table.getCanNextPage()) {
                  table.nextPage();
                }
              }}
              isActive={table.getCanNextPage()}
              className={`${
                !table.getCanNextPage() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {t('next')}
            </PaginationNext>
          </div>
        </div>
    </div>
  );
}