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
  pagination?: {
    totalCount?: number | null;
    hasNextPage?: boolean;
    currentPage?: number | null;
    totalPages?: number | null;
    isOffsetBased?: boolean;
    // Functions
    onLoadMore?: () => void; // For cursor-based infinite scroll
    goToPage?: (page: number) => void; // For offset-based page navigation
    isLoadingMore?: boolean;
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

  const renderPageNumbers = () => {
    const pages = [];
    const showPages = 4;
    const currentPage = pageIndex + 1;

    pages.push(1);

    if (currentPage > showPages) {
      pages.push('ellipsis');
    }

    let rangeStart = Math.max(2, currentPage - 2);
    let rangeEnd = Math.min(pageCount - 1, currentPage + 2);

    if (currentPage <= showPages) {
      rangeEnd = Math.min(pageCount - 1, showPages + 2);
    }
    if (currentPage > pageCount - showPages) {
      rangeStart = Math.max(2, pageCount - showPages - 1);
    }

    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }

    if (currentPage < pageCount - showPages) {
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
          <PaginationContent className="flex w-full flex-wrap items-center">
            <div className="flex-none">
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
                    (
                      configs?.pagination?.isOffsetBased
                        ? (configs.pagination.currentPage ?? 1) <= 1
                        : pageIndex === 0
                    )
                      ? 'pointer-events-none opacity-50'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      configs?.pagination?.isOffsetBased &&
                      configs.pagination.goToPage
                    ) {
                      const prevPage =
                        (configs.pagination.currentPage ?? 1) - 1;
                      if (prevPage >= 1) {
                        configs.pagination.goToPage(prevPage);
                      }
                    } else if (table.getCanPreviousPage()) {
                      table.previousPage();
                    }
                  }}
                >
                  <span className="hidden sm:inline">
                    <Trans i18nKey={'common:pagination.previous'} />
                  </span>
                </PaginationPrevious>
              </PaginationItem>
            </div>

            <div className="flex flex-1 justify-center gap-2">
              {configs?.pagination?.isOffsetBased &&
              configs.pagination.totalPages
                ? // Offset-based pagination: show pages around current page
                  (() => {
                    const totalPages = configs.pagination.totalPages;
                    const currentPage = configs.pagination.currentPage ?? 1;
                    const pages = [];
                    const showPages = 4; // Show up to 4 pages around current

                    // Always show page 1
                    pages.push(1);

                    // Add ellipsis if there's a gap
                    if (currentPage > showPages) {
                      pages.push('ellipsis');
                    }

                    // Calculate range around current page
                    let rangeStart = Math.max(2, currentPage - 2);
                    let rangeEnd = Math.min(totalPages - 1, currentPage + 2);

                    // Adjust range if we're near the beginning
                    if (currentPage <= showPages) {
                      rangeEnd = Math.min(totalPages - 1, showPages + 2);
                    }

                    // Adjust range if we're near the end
                    if (currentPage > totalPages - showPages) {
                      rangeStart = Math.max(2, totalPages - showPages - 1);
                    }

                    // Add pages in range
                    for (let i = rangeStart; i <= rangeEnd; i++) {
                      pages.push(i);
                    }

                    // Add ellipsis if there's a gap before last page
                    if (currentPage < totalPages - showPages) {
                      pages.push('ellipsis');
                    }

                    // Always show last page if there's more than 1 page
                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }

                    return pages.map((page, index) =>
                      page === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis className="text-gray-400" />
                        </PaginationItem>
                      ) : (
                        <PaginationItem key={page}>
                          <PaginationLink
                            className={`h-9 min-w-[2.25rem] rounded-md text-sm font-medium ${
                              page === currentPage
                                ? 'border-none bg-gray-100 text-gray-900'
                                : 'text-gray-700 hover:bg-gray-50'
                            } transition-all duration-200`}
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              if (
                                configs.pagination?.goToPage &&
                                typeof page === 'number'
                              ) {
                                configs.pagination.goToPage(page);
                              }
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ),
                    );
                  })()
                : // Cursor-based pagination: show traditional client-side pagination
                  renderPageNumbers().map((page, index) =>
                    page === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="text-gray-400" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          className={`h-9 min-w-[2.25rem] rounded-md text-sm font-medium ${
                            typeof page === 'number' && pageIndex === page - 1
                              ? 'border-none bg-gray-100 text-gray-900'
                              : 'text-gray-700 hover:bg-gray-50'
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

            <div className="mx-auto flex flex-none items-center gap-4">
              <div className="flex items-center gap-2">
                <SelectRowsPerPage
                  defaultValue={rowsPerPage}
                  handleRowsPerPageChange={handleRowsPerPageChange}
                />
                <span className="text-sm text-gray-500">
                  <Trans i18nKey={'common:of'} />{' '}
                  {configs?.pagination?.totalCount ??
                    table.getFilteredRowModel().rows.length}
                </span>
              </div>

              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors duration-200 ${
                    (
                      configs?.pagination?.isOffsetBased
                        ? !configs.pagination.hasNextPage
                        : pageIndex >= table.getPageCount() - 1
                    )
                      ? 'pointer-events-none opacity-50'
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    if (
                      configs?.pagination?.isOffsetBased &&
                      configs.pagination.goToPage &&
                      configs.pagination.hasNextPage
                    ) {
                      const nextPage =
                        (configs.pagination.currentPage ?? 1) + 1;
                      configs.pagination.goToPage(nextPage);
                    } else if (table.getCanNextPage()) {
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
          </PaginationContent>
        </Pagination>
      )}

      {/* Load More Button for Cursor-based Infinite Scrolling */}
      {!configs?.pagination?.isOffsetBased &&
        configs?.pagination?.hasNextPage && (
          <div className="border-t p-4 text-center">
            <button
              onClick={configs.pagination.onLoadMore}
              disabled={configs.pagination.isLoadingMore}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {configs.pagination.isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <Trans i18nKey={'common:loading'} />
                </span>
              ) : (
                <Trans i18nKey={'common:loadMore'} />
              )}
            </button>
          </div>
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
      <span className="text-sm text-gray-500">
        <Trans i18nKey={'common:rowsPerPage'} />
      </span>
      <Select
        defaultValue={String(defaultValue)}
        onValueChange={handleRowsPerPageChange}
      >
        <SelectTrigger className="w-[100px] rounded-md bg-white font-medium text-gray-500">
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent className="rounded-md text-gray-500">
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
