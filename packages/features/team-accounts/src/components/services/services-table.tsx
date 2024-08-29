'use client';

import { useMemo } from 'react';
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
import { ArrowUp, Link2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Separator } from '@kit/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import { Service } from '../../../../../../apps/web/lib/services.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import DeleteserviceDialog from '../../../../../../packages/features/team-accounts/src/server/actions/services/delete/delete-service';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import UpdateServiceDialog from '../../server/actions/services/update/update-service';

type ServicesTableProps = {
  services: Service.Type[];
  // accountIds: string[];
  // accountNames: string[];
};

// SERVICES TABLE
const servicesColumns = (
  t: TFunction<'services', undefined>,
): ColumnDef<Service.Type>[] => [
  {
    accessorKey: 'name',
    header: t('name'),
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'price',
    header: t('price'),
    cell: ({ row }) => (
      <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
        ${row.getValue('price')} USD/mes
      </div>
    ),
  },
  {
    accessorKey: 'number_of_clients',
    header: t('clients'),
    cell: ({ row }) => (
      <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
        {row.getValue('number_of_clients')}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: t('status'),
    cell: ({ row }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const status = row.getValue('status') as string;
      const displayStatus =
        status === 'active'
          ? 'Activo'
          : status === 'draft'
            ? 'En borrador'
            : status;
      return <div>{displayStatus}</div>;
    },
  },
  {
    accessorKey: 'created_at_column',
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
      const date = new Date(row.original.created_at);
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
      const service = row.original;

      return (
        <div className="h-18 flex items-center gap-4 self-stretch p-4">
          <Link2 className="h-6 w-6 text-gray-500" />
          <UpdateServiceDialog values={service} id={service.id} />
          <DeleteserviceDialog serviceId={service.id} />
        </div>
      );
    },
  },
];

export function ServicesTable({ services }: ServicesTableProps) {
  const { t } = useTranslation('services');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = useMemo<ColumnDef<Service.Type>[]>(
    () => servicesColumns(t),
    [t],
  );

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

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-4 py-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] -translate-y-1/2 transform text-gray-500" />
          <Input
            placeholder="Buscar servicios"
            value={table.getColumn('name')?.getFilterValue() as string}
            onChange={(event) => {
              table.getColumn('name')?.setFilterValue(event.target.value);
            }}
            className="pl-10"
          />
        </div>
        {services.length > 0 ? (
          <Button>
            <Link href="/services/create">{t('createService')}</Link>
          </Button>
        ) : null}
      </div>
      <Separator />
      <div className="mt-4 rounded-md border">
        <Table>
          {table.getRowModel().rows?.length ? (
            <>
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
                {table.getRowModel().rows.map((row) => (
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
                ))}
              </TableBody>
            </>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length}>
                  <div className="flex h-[493px] flex-col place-content-center items-center">
                    <Image
                      src="/images/illustrations/Illustration-box.svg"
                      alt="Illustration Card"
                      width={220}
                      height={160}
                    />
                    <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                      Comencemos con tu primer servicio
                    </h3>
                    <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                      Aún no has creado ningún servicio, agrega uno haciendo
                      clic a continuación.
                    </p>

                    <Button>
                      <Link href="/services/create">{t('createService')}</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>

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
    </div>
  );
}
