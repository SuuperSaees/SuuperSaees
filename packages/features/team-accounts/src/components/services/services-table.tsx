'use client';
import Image from 'next/image';
import { useMemo } from 'react';
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
import { Search, ArrowUp, Link2 } from 'lucide-react';
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
import DeleteserviceDialog from '../../../../../../packages/features/team-accounts/src/server/actions/services/delete/delete-service';
import UpdateServiceDialog from '../../server/actions/services/update/update-service';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Service } from '../../../../../../apps/web/lib/services.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';

type ServicesTableProps = {
  services: Service.Type[];
  accountIds: string[];
  accountNames: string[];
}

// SERVICES TABLE
  const servicesColumns = (
    t: TFunction<'services', undefined>,
  ): ColumnDef<Service.Type>[] => [
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
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
          <Link2 className='h-6 w-6 text-gray-500' />
          <UpdateServiceDialog values={service} id={service.id} />
          <DeleteserviceDialog serviceId={service.id}/>
        </div>
      )
    },
  },
]


export function ServicesTable({ services }: ServicesTableProps) {
  const { t } = useTranslation('services');
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns =  useMemo<ColumnDef<Service.Type>[]>(() => servicesColumns(t), [t]);
  

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
      <div className="flex items-center py-4 justify-end gap-4">
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
        <Button>
          <Link href="/services/create">{t('createService')}</Link>
        </Button>
      </div>
      <Separator />
      <div className="rounded-md border mt-4">
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
                        header.getContext()
                      )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
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
        ))}
      </TableBody>
    </>
  ) : (
    <TableBody>
    <TableRow>
      <TableCell colSpan={table.getAllColumns().length}>
        <div className='flex flex-col place-content-center items-center h-[493px]'>
          <Image
            src="/images/illustrations/Illustration-box.svg"
            alt="Illustration Card"
            width={220}
            height={160}
          />
          <h3 className='w-[352px] text-center text-[20px] text-[#101828] leading-[30px] mb-[20px] font-semibold'>
            Comencemos con tu primer servicio
          </h3>
          <p className='w-[352px] text-center text-[16px] text-[#475467] leading-[24px] mb-[16px]'>
            Aún no has creado ningún servicio, agrega uno haciendo clic a continuación.
          </p>
          <Button>
            <Link href="/services/create">Crear servicio</Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  </TableBody>
  )}
</Table>

{table.getRowModel().rows?.length ? (
    <>
    <div className="flex justify-between items-center py-4">
        <Pagination>
          <PaginationContent className="flex justify-between items-center w-full">
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
            <div className="flex-1 flex justify-center">
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