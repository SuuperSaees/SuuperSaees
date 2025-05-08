'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { ChevronDownIcon } from '@radix-ui/react-icons';
import {
  Search,
} from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

import {
  Card,
  CardContent,
  CardFooter,
} from '@kit/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Separator } from '@kit/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import {
  Tabs,
  TabsContent,
} from '@kit/ui/tabs';

import DatePicker from '../../../../../../packages/features/team-accounts/src/server/actions/orders/pick-date/pick-date';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../../../../packages/ui/src/shadcn/pagination';

type OrdersTableProps = {
  invoices: {
    id: string;
    created_at: string;
    payment_method: string | null;
    customer_organization: string | null;
    status: string;
  }[];
};

const PAGE_SIZE = 10;

export function InvoicesTable({ invoices }: OrdersTableProps) {
  const { t } = useTranslation('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // const filteredOrders = orders.filter(order =>
  //   order.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Filtrar y paginar órdenes
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredInvoices.length / PAGE_SIZE);
  // const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE); <------ is assigned a value but never used. ----->

  // Manejo del cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col py-4">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <Tabs defaultValue="open">
            <div className="mb-4 flex items-center">
              <div className="ml-auto flex items-center gap-2">
                <div className="relative ml-auto flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <ThemedInput
                    type="search"
                    placeholder="Buscar..."
                    className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <Separator />
            <div className="mt-4">
              <TabsContent value="open">
                <Card x-chunk="dashboard-06-chunk-0">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Organización</TableHead>
                          <TableHead>{t('clientLabel')}</TableHead>
                          <TableHead className="hidden md:table-cell">
                            Método de pago
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Estado
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            Creado en
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.length > 0 ? (
                          filteredInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell>
                                <span className="block font-medium">
                                  {invoice.id}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="block text-sm">
                                  #{invoice.id}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="block font-medium">
                                  {invoice.customer_organization ??
                                    'Sin nombre'}
                                </span>
                                <span className="block text-sm">
                                  {invoice.customer_organization ??
                                    'Sin organización'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <DropdownMenu>
                                  <DropdownMenuTrigger className="m-2 flex inline-flex items-center rounded-lg bg-warning-100 p-2 text-warning-700">
                                    <span className="pl-2 pr-2">
                                      {invoice.status}
                                    </span>
                                    <ChevronDownIcon className="flex items-center" />
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="m-2 rounded-lg bg-warning-100 p-2 text-warning-700">
                                      En revisión
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-black-700 m-2 rounded-lg bg-brand-100 p-2">
                                      En progreso
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="m-2 rounded-lg bg-yellow-100 p-2 text-yellow-700">
                                      Esperando respuesta
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="m-2 rounded-lg bg-success-100 p-2 text-success-700">
                                      Completado
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="m-2 rounded-lg bg-error-100 p-2 text-error-700">
                                      En pausa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="m-2 rounded-lg bg-gray-100 p-2 text-gray-700">
                                      En cola
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <div className="flex -space-x-1">
                                  {/* Aquí puedes agregar los elementos que necesitas */}
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <DatePicker
                                  title={''}
                                  description={null}
                                  customer_id={''}
                                  assigned_to={null}
                                  due_date={null}
                                  propietary_organization_id={''}
                                  {...invoice}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="py-10 text-center"
                            >
                              <div className="flex h-[493px] flex-col place-content-center items-center">
                                <Image
                                  src="/images/illustrations/Illustration-card.svg"
                                  alt="Illustration Card"
                                  width={220}
                                  height={160}
                                />
                                <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                                  Comencemos con tu primera factura
                                </h3>
                                <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                                  Aún no haz creado ninguna factura, agrega uno
                                  haciendo clic a continuación.
                                </p>
                                {/* <Link href="/invoices/create">
          <Button>
            Crear factura
            {/*Hay que arreglar este redirect}
          </Button>
          </Link> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    {/* <Pagination>
                    <PaginationContent>
                      <div className="space-between flex flex-row justify-between w-full">
                        <div>
                          <PaginationItem>
                            <PaginationPrevious href="#" />
                            <PaginationNext href="#" />
                          </PaginationItem>
                        </div>
                        <div className="flex flex-row">
                          <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">2</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">3</PaginationLink>
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink href="#">10</PaginationLink>
                          </PaginationItem>
                        </div>
                      </div>
                    </PaginationContent>
                  </Pagination> */}
                    {filteredInvoices.length > 0 && (
                      <Pagination>
                        <PaginationContent>
                          <div className="space-between flex w-full flex-row justify-between">
                            <div>
                              <PaginationItem>
                                <PaginationPrevious
                                  href="#"
                                  onClick={() =>
                                    handlePageChange(
                                      Math.max(currentPage - 1, 1),
                                    )
                                  }
                                />
                                <PaginationNext
                                  href="#"
                                  onClick={() =>
                                    handlePageChange(
                                      Math.min(currentPage + 1, totalPages),
                                    )
                                  }
                                />
                              </PaginationItem>
                            </div>
                            <div className="flex flex-row">
                              {Array.from(
                                { length: totalPages },
                                (_, index) => (
                                  <PaginationItem key={index + 1}>
                                    <PaginationLink
                                      href="#"
                                      onClick={() =>
                                        handlePageChange(index + 1)
                                      }
                                      isActive={currentPage === index + 1}
                                    >
                                      {index + 1}
                                    </PaginationLink>
                                  </PaginationItem>
                                ),
                              )}
                              {totalPages > 5 &&
                                currentPage < totalPages - 2 && (
                                  <PaginationItem>
                                    <PaginationEllipsis />
                                  </PaginationItem>
                                )}
                            </div>
                          </div>
                        </PaginationContent>
                      </Pagination>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
