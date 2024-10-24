'use client';

import { useMemo } from 'react';
import * as React from 'react';

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
import { ArrowUp, Link2, Pen, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { Separator } from '@kit/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { TabsList } from '@kit/ui/tabs';

import DeleteServiceDialog from '../../../../../../apps/web/app/services/delete/delete-component';
import EmptyState from '../../../../../../apps/web/components/ui/empty-state';
import { SkeletonTable } from '../../../../../../apps/web/components/ui/skeleton';
import { Service } from '../../../../../../apps/web/lib/services.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from '../../../../accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from '../../../../accounts/src/components/ui/tab-themed-with-settings';

type ServicesTableProps = {
  services: Service.Type[];
  activeTab: string;
  accountRole: string;
  hasTheEmailAssociatedWithStripe: boolean;
  handleCheckout: (priceId: string) => Promise<void>;
  isLoading: boolean;
};

// SERVICES TABLE
const servicesColumns = (
  t: TFunction<'services', undefined>,
  accountRole: string,
  hasTheEmailAssociatedWithStripe: boolean,
  handleCheckout: (priceId: string) => Promise<void>,
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
    cell: ({ row }) => {
      const price = row.getValue('price');
      const recurrence = row.original.recurrence;
      return (
        <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
          ${price as number} USD {recurrence ? ` / ${recurrence}` : ''}
        </div>
      );
    },
  },
  {
    accessorKey: 'price_id',
    header: 'Price ID',
    cell: ({ row }) => (
      <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
        {row.getValue('price_id')}
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
      const priceId = service.price_id as string;
      // eslint-disable-next-line react-hooks/rules-of-hooks

      return (
        <div className="h-18 flex items-center gap-4 self-stretch p-4">
          {accountRole === 'agency_owner' && (
            <div>
              {hasTheEmailAssociatedWithStripe && (
                <Link2
                  onClick={() =>
                    service.price_id && handleCheckout(service.price_id)
                  }
                  className="h-6 w-6 cursor-pointer text-gray-500"
                />
              )}
            </div>
          )}
          {/* {accountRole === "agency_owner" && <UpdateServiceDialog valuesOfServiceStripe={service} />} */}
          {accountRole === 'agency_owner' && (
            <Link href={`/services/update?id=${service.id}`}>
              <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
            </Link>
          )}
          {accountRole === 'agency_owner' && (
            <DeleteServiceDialog priceId={priceId} />
          )}
        </div>
      );
    },
  },
];

export function ServicesTable({
  activeTab,
  services,
  accountRole,
  hasTheEmailAssociatedWithStripe,
  handleCheckout,
  isLoading,
}: ServicesTableProps) {
  const { t } = useTranslation(['services', 'briefs']);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const columns = useMemo<ColumnDef<Service.Type>[]>(
    () =>
      servicesColumns(
        t,
        accountRole,
        hasTheEmailAssociatedWithStripe,
        handleCheckout,
      ),
    [t, accountRole, hasTheEmailAssociatedWithStripe],
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
      <div className="flex items-center justify-between gap-4 py-4">
        <TabsList className="gap-2 bg-transparent">
          <ThemedTabTrigger
            value="services"
            activeTab={activeTab}
            option={'services'}
          >
            {t('services:serviceTitle')}
          </ThemedTabTrigger>
          <ThemedTabTrigger
            value="briefs"
            activeTab={activeTab}
            option={'briefs'}
          >
            {t('briefs:briefs', { ns: 'briefs' })}
          </ThemedTabTrigger>
        </TabsList>

        <div className="flex gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] -translate-y-1/2 transform bg-white text-gray-500" />
            <ThemedInput
              placeholder={t('searchServices')}
              value={table.getColumn('name')?.getFilterValue() as string}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                table.getColumn('name')?.setFilterValue(event.target.value);
              }}
              className="bg-white pl-10" // Asegúrate de que el input tenga un fondo blanco
            />
          </div>
          {services.length > 0 && accountRole === 'agency_owner' ? (
            <Link href="/services/create">
              <ThemedButton>{t('createService')}</ThemedButton>
            </Link>
          ) : null}
        </div>
      </div>
      <Separator />
      {isLoading ? (
        <SkeletonTable columns={7} rows={7} className="mt-6" />
      ) : !table.getRowModel().rows?.length ? (
        <div className="mt-6 flex h-full flex-col rounded-md border bg-white p-2">
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t('startFirstService')}
          description={t('noServicesMessage')}
          button={
            accountRole === 'agency_owner' ? (
              <Link href="/services/create">
                <ThemedButton>{t('createService')}</ThemedButton>
              </Link>
            ) : undefined
          }
        />
        </div>
      ) : (
        <div className="mt-[24px] rounded-md border bg-white px-4">
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
          </Table>
        </div>
      )}

      {table.getRowModel().rows?.length ? (
        <>
          <div className="flex items-center justify-between py-4">
            <Pagination>
              <PaginationContent className="flex w-full items-center justify-between">
                {pageIndex > 0 && (
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
                )}
                <div className="flex flex-1 justify-center">
                  {pages.length > 1 &&
                    pages.map((page) => (
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
                {pageIndex < pageCount - 1 && (
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
                )}
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
