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
import { ArrowUp, Search } from 'lucide-react';
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

import { Brief } from '../../../../../../apps/web/lib/brief.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import {
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
// import CreateBriefDialog from '../../server/actions/briefs/create/create-brief-ui';
import DeleteBriefDialog from '../../server/actions/briefs/delete/delete-brief-ui';
import UpdateBriefDialog from '../../server/actions/briefs/update/update-brief-ui';
import { useRouter } from 'next/navigation'

type BriefTableProps = {
  briefs: Brief.Type[];
  accountIds: string[];
};

// SERVICES TABLE
// TFunction<'briefs', undefined>
const briefColumns = (
  t: TFunction<'briefs', undefined>,
): ColumnDef<Brief.Type>[] => [
  {
    accessorKey: 'name',
    header: t('name'),
    cell: ({ row }) => {
      return <div className="capitalize">{row.getValue('name')}</div>;
    },
  },
  {
    accessorKey: 'services',
    header: t('services'),
    cell: ({ row }) => {
      const services = row.original.services;
      const tagColors = [
        {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300',
        },
        {
          bgColor: 'bg-violet-100',
          textColor: 'text-violet-800',
          borderColor: 'border-violet-300',
        },
        {
          bgColor: 'bg-fuchsia-100',
          textColor: 'text-fuchsia-800',
          borderColor: 'border-fuchsia-300',
        },
        {
          bgColor: 'bg-cyan-100',
          textColor: 'text-cyan-800',
          borderColor: 'border-cyan-300',
        },
        {
          bgColor: 'bg-teal-100',
          textColor: 'text-teal-800',
          borderColor: 'border-teal-300',
        },
      ];
      const maxTags = 4;
      //   console.log('s', services);
      return (
        <div className="flex gap-2">
          {services?.map((service, index) => {
            // random tagColor to each service
            const tagColor =
              tagColors[Math.floor(Math.random() * tagColors.length)];
            if (index + 1 === services.length && index + 1 > maxTags) {
              return (
                <div
                  key={index}
                  className="flex items-center gap-1 truncate rounded-full border border-neutral-200 bg-gray-100 px-2 text-sm font-medium text-gray-500"
                >
                  +{services.length - index}
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={`boder-neutral-400 rounded-full border px-2 ${tagColor?.bgColor} ${tagColor?.textColor} ${tagColor?.borderColor} truncate font-semibold`}
                >
                  {service.name}
                </div>
              );
            }
          })}
        </div>
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
      const brief = row.original;

      return (
        <div className="h-18 flex items-center gap-4 self-stretch p-4">
          <UpdateBriefDialog {...brief} />
          <DeleteBriefDialog briefId={brief.id} />
        </div>
      );
    },
  },
];

export function BriefsTable({ briefs, accountIds }: BriefTableProps) {
  const { t } = useTranslation(['services','briefs']);
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [activeButton, setActiveButton] = React.useState<'services' | 'briefs'>(
    'briefs',
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = useMemo<ColumnDef<Brief.Type>[]>(() => briefColumns(t), [t]);

  const handleButtonClick = (button: 'services' | 'briefs') => {
    setActiveButton(button);
    if (button === 'services') {
      router.push('/services')
    } else if (button === 'briefs') {
      router.push('/briefs')
    }
  };

  const table = useReactTable({
    data: briefs,
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

  // const importantPropietaryOrganizationId = accountIds[0];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
      <div className='flex gap-2'>
          <Button
          variant="ghost"
          className={`flex h-9 items-center gap-2 rounded-md p-2 px-3 ${activeButton === 'services' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'}`}
          onClick={() => handleButtonClick('services')}
          >
            {t('services:serviceTitle')}
          </Button>
          <Button
          variant="ghost"
          className={`flex h-9 items-center gap-2 rounded-md p-2 px-3 ${activeButton === 'briefs' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'}`}
          onClick={() => handleButtonClick('briefs')}
          
          >
            {t('briefs:briefs', {ns:'briefs'})}
          </Button>
        </div>
        <div className="flex w-full justify-end gap-4 px-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-[20px] w-[20px] -translate-y-1/2 transform text-gray-500" />
            <Input
              placeholder="Buscar briefs..."
              value={table.getColumn('name')?.getFilterValue() as string}
              onChange={(event) => {
                table.getColumn('name')?.setFilterValue(event.target.value);
              }}
              className="pl-10"
            />
          </div>
          {/* <CreateBriefDialog
            propietary_organization_id={importantPropietaryOrganizationId ?? ''}
          /> */}
          <Link href="/briefs/create">
            <ThemedButton>{t('createBrief')}</ThemedButton>
          </Link>
        </div>
      </div>
      <Separator />
      <div className="mt-4 rounded-md border">
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
              !table.getCanNextPage() ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {t('next')}
          </PaginationNext>
        </div>
      </div>
    </div>
  );
}
