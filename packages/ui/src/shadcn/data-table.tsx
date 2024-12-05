'use client';

import type { ColumnDef, TableOptions } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { Trans } from '../makerkit/trans';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  options?: TableOptions<TData>;
  className?: string;
  emptyStateComponent?: React.ReactNode;
  disableInteractions?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  options,
  className,
  emptyStateComponent,
  disableInteractions,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    ...options,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className={'rounded-lg border border-gray-100 ' + className}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="text-nowrap px-6 py-3 align-top text-black"
                  >
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

        <TableBody className={disableInteractions ? 'pointer-events-none' : ''}>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-row-id={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="odd:bg-gray-50 even:bg-transparent"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-6 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                {emptyStateComponent ? (
                  emptyStateComponent
                ) : (
                  <Trans i18nKey={'common:noData'} />
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {table.getRowModel().rows?.length > 0 && (
        <Pagination className="border-t p-4">
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
                >
                  <Trans i18nKey={'common:pagination.previous'} />
                </PaginationPrevious>
              </PaginationItem>
            )}

            <div className="flex flex-1 justify-center">
              {pages.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    className={`${pageIndex === page - 1 ? '? bg-gray-100' : ''} border-none hover:bg-gray-50`}
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
                >
                  <Trans i18nKey={'common:pagination.next'} />
                </PaginationNext>
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
