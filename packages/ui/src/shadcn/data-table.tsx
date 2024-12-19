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
import { Button } from './button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
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
import { Combobox } from '../../../../apps/web/components/ui/combobox';
import { FilterIcon } from 'lucide-react';
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  options?: TableOptions<TData>;
  className?: string;
  emptyStateComponent?: React.ReactNode;
  disableInteractions?: boolean;
  presetFilters?: {
    filterableColumns: string[];
  }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  options,
  className,
  emptyStateComponent,
  disableInteractions,
  presetFilters,
}: DataTableProps<TData, TValue>) {
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState(data);
  const onFilter = (columnKey: string, value: string) => {
    setFilteredData(data.filter((item) => item[columnKey] === value));
  };
  const table = useReactTable({
    ...options,
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: rowsPerPage } },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const handleRowsPerPageChange = (value: string) => {
    const newValue = Number(value);
    if (!isNaN(newValue) && newValue > 0 && newValue <= 100) {
      setRowsPerPage(newValue);
      table.setPageSize(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-8"> 
        {presetFilters && (
          <PresetFilters columns={columns} data={data} filterableColumns={presetFilters.filterableColumns} onFilter={onFilter}/>
        )}
           <SelectRowsPerPage
              handleRowsPerPageChange={handleRowsPerPageChange}
            />
      </div>
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
          <PaginationContent className="flex w-full items-center justify-between gap-4">
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
                    className={`${
                      pageIndex === page - 1 ? 'bg-gray-100' : ''
                    } border-none hover:bg-gray-50`}
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
    </div>
  );
}

interface SelectRowsPerPageProps {
  handleRowsPerPageChange: (value: string) => void;
}

export function SelectRowsPerPage({
  handleRowsPerPageChange,
}: SelectRowsPerPageProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        <Trans i18nKey={'common:rowsPerPage'} />
      </span>
      <Select defaultValue="10" onValueChange={handleRowsPerPageChange}>
        <SelectTrigger className="w-[100px] rounded-md font-medium bg-white">
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

interface PresetFiltersProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterableColumns: string[];
  onFilter: (columnKey: string, value: string) => void;
}

const PresetFilters = <TData, TValue>({
  columns,
  data,
  filterableColumns,
  onFilter,
}: PresetFiltersProps<TData, TValue>) => {
  const dataByColumn = columns.reduce((acc, column) => {
    if (filterableColumns.includes(column.accessorKey)) {
      acc[column.accessorKey] = Array.from(
        new Set(
          data
            .map((item) => item[column.accessorKey])
            .filter((value) => value !== null && value !== undefined)
        )
      );
    }
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit text-sm font-semibold text-gray-600 flex items-center gap-2">
          <span>Filters</span>
          <FilterIcon className="w-4 h-4" />
        </Button>
  
      </PopoverTrigger>
      <PopoverContent>
        {columns
          .filter((column) => filterableColumns.includes(column.accessorKey))
          .map((column) => (
            <div key={column.accessorKey} className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-600">{column.header}</span>
              <Combobox
                options={dataByColumn[column.accessorKey]?.map((item) => ({
                  value: item,
                  // label should be the first letter uppercase and the rest lowercase also remove _ and - and replace them with a space
                  label: item.charAt(0).toUpperCase() + item.slice(1).replace(/(_|-)/g, ' '),
                  actionFn: () => onFilter(column.accessorKey, item),
                }))}
                
                className="w-full text-sm"
      
              />
            </div>
          ))}
      </PopoverContent>
    </Popover>
  );
};



