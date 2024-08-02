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
import DeleteserviceDialog from '../../../../../../packages/features/team-accounts/src/server/actions/services/delete/delete-service';
import CreateServiceDialog from '../../../../../../packages/features/team-accounts/src/server/actions/services/create/create-service';
import UpdateServiceDialog from '../../server/actions/services/update/update-service';
import { useTranslation } from 'react-i18next';


type ServicesTableProps = {
services: {
    id: string
    created_at: string
    name: string 
    price: number
    number_of_clients: number
    status: string
    propietary_organization_id: string
  }[];
  accountIds: string[];
  accountNames: string[];

}


type Service = {
    id: string
    created_at: string
    name: string 
    price: number
    number_of_clients: number
    status: string
    propietary_organization_id: string
}

// SERVICES TABLE
  const servicesColumns = (t: any): ColumnDef<Service>[] => [
  {
    accessorKey: "name",
    header: t("name"),
    cell: ({ row }) => {
      return (
        <div className="capitalize">{row.getValue("name")}</div>
      );
    },
  },
  {
    accessorKey: "price",
    header: t("price"),
    cell: ({ row }) => (
      <div className='text-gray-600 font-sans text-sm font-normal leading-[1.42857]'>${row.getValue("price")} USD/mes</div>
    ),
  },
  {
    accessorKey: "number_of_clients",
    header: t("clients"),
    cell: ({ row }) => (
      <div className='text-gray-600 font-sans text-sm font-normal leading-[1.42857]'>{row.getValue("number_of_clients")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: t("status"),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const displayStatus = status === 'active' ? 'Activo' : status === 'draft' ? 'En borrador' : status;
      return <div>{displayStatus}</div>;
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
      const service = row.original
 
      return (
        <div className='flex h-18 p-4 items-center gap-4 self-stretch'>
          <UpdateServiceDialog {...service} />
          <DeleteserviceDialog serviceId={service.id}/>
        </div>
      )
    },
  },
]


export function ServicesTable({ services,  accountIds, accountNames  }: ServicesTableProps) {
  const { t } = useTranslation('services');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

//   const uniqueClients = useMemo(() => getUniqueOrganizations(clients), [clients]);
//   const columns = useMemo<ColumnDef<Client>[]>(() => activeButton === 'clientes' ? clientColumns(t) : organizationColumns(t), [t, activeButton]);
  const columns =  useMemo<ColumnDef<Service>[]>(() => servicesColumns(t), [t]);
  

  const table = useReactTable({
    data: services,
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


  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-between">
        <div className='flex px-2 gap-4'>
          <div className='relative max-w-sm'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-[20px] h-[20px]' />
            <Input
              placeholder="Buscar servicios"
              value={
                table.getColumn("name")?.getFilterValue() as string
              }
              onChange={(event) => {
                table.getColumn("name")?.setFilterValue(event.target.value);
              }}
              className="pl-10"
            />
          </div>
          <CreateServiceDialog  propietary_organization_id={importantPropietaryOrganizationId ?? ''}/>
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