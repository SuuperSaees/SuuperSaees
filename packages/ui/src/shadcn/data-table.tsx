'use client';

import { useState } from 'react';

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
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
  configs?: CustomConfigs;
}

export interface CustomConfigs {
  rowsPerPage: {
    onUpdate: (value: string) => void;
    value: number;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  options,
  className,
  emptyStateComponent,
  disableInteractions,
  configs,
}: DataTableProps<TData, TValue>) {
  const [rowsPerPage, setRowsPerPage] = useState(
    configs?.rowsPerPage.value ?? 10,
  );
  const [customPageNumber, setCustomPageNumber] = useState('');

  const table = useReactTable({
    ...options,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: rowsPerPage } },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();

  const handleRowsPerPageChange = (value: string) => {
    configs?.rowsPerPage.onUpdate(value);
    const newValue = Number(value);
    if (!isNaN(newValue) && newValue > 0 && newValue <= 100) {
      setRowsPerPage(newValue);
      table.setPageSize(newValue);
    }
  };

  const handleCustomPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(customPageNumber);
    if (pageNum && pageNum > 0 && pageNum <= pageCount) {
      table.setPageIndex(pageNum - 1);
    }
    setCustomPageNumber('');
  };

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 3;

    pages.push(1);

    if (pageIndex > showPages) {
      pages.push('ellipsis');
    }

    for (
      let i = Math.max(2, pageIndex);
      i <= Math.min(pageIndex + 2, pageCount - 1);
      i++
    ) {
      pages.push(i);
    }

    if (pageIndex < pageCount - showPages) {
      pages.push('ellipsis');
    }

    if (pageCount > 1) {
      pages.push(pageCount);
    }

    return pages;
  };

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
          <PaginationContent className="flex w-full flex-wrap items-center justify-between gap-8">
            {/* Left side: Pagination controls */}
            <div className="flex flex-wrap items-center gap-8 sm:flex-1">
              <div className="mx-auto flex items-center gap-8 2xl:mx-0 2xl:ml-auto">
                <PaginationItem
                  className={`${pageIndex > 0 ? 'visible' : 'invisible'} transition-all duration-200`}
                >
                  <PaginationPrevious
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      if (table.getCanPreviousPage()) {
                        table.previousPage();
                      }
                    }}
                  >
                    <span className="hidden sm:inline">
                      <Trans i18nKey={'common:pagination.previous'} />
                    </span>
                  </PaginationPrevious>
                </PaginationItem>
                <div className="flex gap-1">
                  {renderPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="text-gray-400" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          className={`h-9 min-w-[2.25rem] rounded-md text-sm font-medium ${
                            typeof page === 'number' && pageIndex === page - 1
                              ? 'bg-gray-900 text-white hover:bg-gray-800 hover:text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          } transition-all duration-200`}
                          href="#"
                          isActive={
                            typeof page === 'number' && pageIndex === page - 1
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            if (typeof page === 'number') {
                              table.setPageIndex(page - 1);
                            }
                          }}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                </div>
                <PaginationItem
                  className={`${pageIndex < pageCount - 1 ? 'visible' : 'invisible'} transition-all duration-200`}
                >
                  <PaginationNext
                    href="#"
                    className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      if (table.getCanNextPage()) {
                        table.nextPage();
                      }
                    }}
                  >
                    <span className="hidden sm:inline">
                      <Trans i18nKey={'common:pagination.next'} />
                    </span>
                  </PaginationNext>
                </PaginationItem>
              </div>
            </div>

            {/* Right side: Results info and controls */}
            <div className="mx-auto flex flex-wrap items-center gap-4 sm:justify-end">
              {/* Results count */}
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">
                  <Trans i18nKey="common:showing" />{' '}
                </span>
                {table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
                  1}
                -
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) *
                    table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length,
                )}{' '}
                <Trans i18nKey="common:of" />{' '}
                {table.getFilteredRowModel().rows.length}
              </div>

              {/* Go to page form */}
              <form
                onSubmit={handleCustomPageSubmit}
                className="flex items-center gap-2"
              >
                <span className="hidden text-sm text-gray-500 sm:inline">
                  <Trans i18nKey="common:goToPage" />:
                </span>
                <input
                  type="number"
                  min={1}
                  max={pageCount}
                  value={customPageNumber}
                  onChange={(e) => setCustomPageNumber(e.target.value)}
                  className="w-16 rounded-md border border-gray-200 px-2 py-1 text-sm focus:border-gray-300 focus:outline-none"
                  placeholder={`1-${pageCount}`}
                />
                <button
                  type="submit"
                  className="rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none"
                >
                  <Trans i18nKey="common:go" />
                </button>
              </form>

              {/* Rows per page selector */}
              <SelectRowsPerPage
                defaultValue={rowsPerPage}
                handleRowsPerPageChange={handleRowsPerPageChange}
              />
            </div>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

interface SelectRowsPerPageProps {
  handleRowsPerPageChange: (value: string) => void;
  defaultValue: number;
}

export function SelectRowsPerPage({
  handleRowsPerPageChange,
  defaultValue,
}: SelectRowsPerPageProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        <Trans i18nKey={'common:rowsPerPage'} />
      </span>
      <Select
        defaultValue={String(defaultValue)}
        onValueChange={handleRowsPerPageChange}
      >
        <SelectTrigger className="w-[100px] rounded-md bg-white font-medium">
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent className="rounded-md text-gray-600">
          <SelectItem value="5">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 5 }} />
          </SelectItem>
          <SelectItem value="10">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 10 }} />
          </SelectItem>
          <SelectItem value="15">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 15 }} />
          </SelectItem>
          <SelectItem value="20">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 20 }} />
          </SelectItem>
          <SelectItem value="25">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 25 }} />
          </SelectItem>
          <SelectItem value="50">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 50 }} />
          </SelectItem>
          <SelectItem value="100">
            <Trans i18nKey={'common:rowNumber'} values={{ number: 100 }} />
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
