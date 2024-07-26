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
import { Ellipsis } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Database } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from "@kit/ui/checkbox"
import { DataTable } from '@kit/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@kit/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@kit/ui/table"
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { ProfileAvatar } from '@kit/ui/profile-avatar';
import { Trans } from '@kit/ui/trans';
import { RemoveMemberDialog } from './remove-member-dialog';
import { RoleBadge } from './role-badge';
import { TransferOwnershipDialog } from './transfer-ownership-dialog';
import { UpdateMemberRoleDialog } from './update-member-role-dialog';
import { Search, Pen, ArrowUp, ArrowDown, Users2Icon, Trash2 } from 'lucide-react';
import { Separator } from '@kit/ui/separator';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import DeleteUserDialog from '../../../../../../packages/features/team-accounts/src/server/actions/delete-client';


type ClientsTableProps = {
  clients: {
    id: string
    created_at: string
    name: string
    client_organization: string
    email: string
    role: string
    propietary_organization: string
    propietary_organization_id: string
    picture_url: string | null
  }[];
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

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
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
    header: "Rol",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("role")}</div>
    ),
  },
  {
    accessorKey: "client_organization",
    header: "Organización",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("client_organization")}</div>
    ),
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <div >
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className='flex justify-between items-center'>
              <span>Último inicio de sesión</span>
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
    accessorKey: "created_at",
    header: ({ column }) => {
      return (
        <div >
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <div className='flex justify-between items-center'>
              <span>Creado en</span>
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
    header: "Acciones",
    enableHiding: false,
    cell: ({ row }) => {
      const client = row.original
 
      return (
        <div className='flex h-18 p-4 items-center gap-4 self-stretch'>
          <Users2Icon className="h-4 w-4 text-gray-600" />
          <Pen className="h-4 w-4 text-gray-600" />
          {/* <Trash2 className="h-4 w-4 text-gray-600" /> */}
          <DeleteUserDialog userId={client.id}/>
        </div>
      )
    },
  },
]

export function ClientsTable({ clients }: ClientsTableProps ) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
 
  const table = useReactTable({
    data: clients,
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
  })
 
  return (
    <div className="w-full">
      <div className="flex items-center py-4 justify-end space-x-4">
      <div className='relative max-w-sm'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-[20px] h-[20px]' />
          <Input
            placeholder="Filtrar nombres..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="pl-10"
          />
        </div>
        <Button>
          Crear cliente
        </Button>
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
      <div className="flex justify-between items-center mt-4">
        <Pagination className="w-full">
          <PaginationPrevious href="#" className="mr-auto" />
          <div>
            <PaginationLink href="#" isActive>1</PaginationLink>
            <PaginationLink href="#" >
                2
            </PaginationLink>
            <PaginationLink href="#">3</PaginationLink>
            <PaginationLink href="#">...</PaginationLink>
            <PaginationLink href="#">8</PaginationLink>
            <PaginationLink href="#">9</PaginationLink>
            <PaginationLink href="#">10</PaginationLink>

          </div>
          <PaginationNext href="#" className="ml-auto" />
        </Pagination>
      </div>
    </div>
  )
}

