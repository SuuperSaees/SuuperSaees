'use client';

import React, { useState } from 'react';



import Image from 'next/image';
import Link from 'next/link';



import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { updateOrder } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardFooter } from '@kit/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { Order } from '~/lib/order.types';
import { statuses } from '~/lib/orders-data';

import { ThemedButton } from '../../../../../packages/features/accounts/src/components/ui/button-themed-with-settings';
import DatePicker from '../../../../../packages/features/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../../../packages/ui/src/shadcn/pagination';
import { statusColors } from '../[id]/utils/get-color-class-styles';


type ExtendedOrderType = Order.Type & {
  customer_name: string | null;
  customer_organization: string | null;
};

// Use the extended type
type OrdersTableProps = {
  orders: ExtendedOrderType[];
};

const PAGE_SIZE = 10;

export function OrderList({ orders }: OrdersTableProps) {
  const { t } = useTranslation('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'open' | 'completed' | 'all'>('open'); // Initial state

  const handleTabClick = (value: 'open' | 'completed' | 'all') => {
    setActiveTab(value);
  };
  // const filteredOrders = orders.filter(order =>
  //   order.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // Filtrar y paginar órdenes
  const filteredOrders = orders.filter((order) =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  // const paginatedOrders = filteredOrders.slice(
  //   (currentPage - 1) * PAGE_SIZE,
  //   currentPage * PAGE_SIZE,
  // );

  // Manejo del cambio de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  const updateOrderDate = async (due_date: string, orderId: number) => {
    try {
      await updateOrder(orderId, { due_date });
      toast('Success!', {
        description: 'The date has been updated.',
      });
    } catch (error) {
      toast('Error', {
        description: 'The date could not be updated.',
      });
    }
  };

  const changeStatus = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: Order.Type['id'];
      status: Order.Type['status'];
    }) => {
      return updateOrder(orderId, { status });
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Status updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'The status could not be updated.',
      });
    },
  });

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col py-4">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <Tabs defaultValue="open">
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <TabsList className='bg-transparent'>
              <TabsTrigger
    value="open"
    className={`flex h-9 p-2 px-3 items-center gap-2 rounded-md ${
      activeTab === 'open' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'
    } hover:bg-primary/20 cursor-pointer ml-5`} // Margen izquierdo de 20px
    onClick={() => handleTabClick('open')}
  >
    {t('openOrders')}
  </TabsTrigger>
  
  <TabsTrigger
    value="completed"
    className={`flex h-9 p-2 px-3 items-center gap-2 rounded-md ${
      activeTab === 'completed' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'
    } hover:bg-primary/20 cursor-pointer ml-5`} // Margen izquierdo de 20px
    onClick={() => handleTabClick('completed')}
  >
    {t('completedOrders')}
  </TabsTrigger>
  
  <TabsTrigger
    value="all"
    className={`flex h-9 p-2 px-3 items-center gap-2 rounded-md ${
      activeTab === 'all' ? 'bg-primary/10 text-black-700' : 'bg-transparent text-gray-500'
    } hover:bg-primary/20 cursor-pointer ml-5`} // Margen izquierdo de 20px
    onClick={() => handleTabClick('all')}
  >
    {t('allOrders')}
  </TabsTrigger>
                {/* <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filtrar
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Archived
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <div className="relative ml-auto flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <ThemedInput
                    type="search"
                    placeholder="Buscar..."
                    className="focus-visible:ring-none w-full rounded-lg pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {orders.length > 0 ? (
                  <Link href="/orders/create">
                    <ThemedButton>Crear pedido</ThemedButton>
                  </Link>
                ) : null}
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
                          <TableHead>{t('titleLabel')}</TableHead>
                          <TableHead>{t('idLabel')}</TableHead>
                          <TableHead>{t('clientLabel')}</TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('statusLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('assignedToLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('dueDateLabel')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length > 0 ? (
                          filteredOrders
                            .filter(
                              (order) =>
                                order.status !== 'completed' &&
                                order.status !== 'annulled',
                            )
                            .map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="flex-1">
                                  <Link href={`/orders/${order.id}`}>
                                    <span className="block max-w-[200px] truncate font-medium">
                                      {order.title}
                                    </span>
                                  </Link>
                                  <span className="block max-w-[150px] truncate text-sm">
                                    {order.customer_organization ??
                                      'Sin descripción'}
                                  </span>
                                </TableCell>
                                <TableCell className="flex-1">
                                  <span className="block text-sm">
                                    #{order.id}
                                  </span>
                                </TableCell>
                                <TableCell className="flex-1">
                                  <span className="block max-w-[200px] truncate font-medium">
                                    {order.customer_name ?? 'Sin nombre'}
                                  </span>
                                  <span className="block text-sm">
                                    {order.customer_organization ??
                                      'Sin organización'}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      className={`m-2 flex inline-flex items-center rounded-lg p-2 ${order.status ? statusColors[order.status] : ''}`}
                                    >
                                      <span className="pl-2 pr-2">
                                        {order.status
                                          ?.replace(/_/g, ' ')
                                          .replace(/^\w/, (c) =>
                                            c.toUpperCase(),
                                          )}
                                      </span>
                                      <ChevronDownIcon className="flex items-center"></ChevronDownIcon>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {statuses.map((status, statusIndex) => {
                                        const camelCaseStatus = status?.replace(
                                          /_./g,
                                          (match) =>
                                            match.charAt(1).toUpperCase(),
                                        );
                                        if (!status) return null;
                                        return (
                                          <DropdownMenuItem
                                            className={`m-2 rounded-lg p-2 ${statusColors[status]} cursor-pointer`}
                                            key={status + statusIndex}
                                            onClick={() => {
                                              changeStatus.mutate({
                                                orderId: order.id,
                                                status,
                                              });
                                            }}
                                          >
                                            {t(
                                              `details.statuses.${camelCaseStatus}`,
                                            )
                                              .replace(/_/g, ' ') // Replace underscores with spaces (even though there are no underscores in the priorities array)
                                              .replace(/^\w/, (c) =>
                                                c.toUpperCase(),
                                              )}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <div className="flex -space-x-1">
                                    {order.assigned_to?.map((assignee) => (
                                      <Avatar
                                        key={assignee.agency_member.email}
                                        className="h-6 max-h-6 w-6 max-w-6 border-2 border-white"
                                      >
                                        <AvatarFallback>
                                          {assignee.agency_member.name.charAt(
                                            0,
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <DatePicker
                                    updateFn={(dueDate: string) =>
                                      updateOrderDate(dueDate, order.id)
                                    }
                                    defaultDate={order.due_date}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="flex-1 py-10 text-center"
                            >
                              <div className="flex h-[493px] flex-col place-content-center items-center">
                                <Image
                                  src="/images/illustrations/Illustration-files.svg"
                                  alt="Illustration Card"
                                  width={220}
                                  height={160}
                                />
                                <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                                  Comencemos con tu primer pedido
                                </h3>
                                <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                                  Aún no haz creado ningún pedido, agrega uno
                                  haciendo clic a continuación.
                                </p>
                                <Link href="/orders/create">
                                  <Button className="po">Crear pedido</Button>
                                </Link>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    {filteredOrders.length ? (
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
                    ) : (
                      <></>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="completed">
                <Card x-chunk="dashboard-06-chunk-0">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('titleLabel')}</TableHead>
                          <TableHead>{t('idLabel')}</TableHead>
                          <TableHead>{t('clientLabel')}</TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('statusLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('assignedToLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('dueDateLabel')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.length > 0 ? (
                          filteredOrders
                            .filter((order) => order.status == 'completed')
                            .map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="flex-1">
                                  <Link href={`/orders/${order.id}`}>
                                    <span className="block max-w-[200px] truncate font-medium">
                                      {order.title}
                                    </span>
                                  </Link>
                                  <span className="block max-w-[150px] truncate text-sm">
                                    {order.description ?? 'Sin descripción'}
                                  </span>
                                </TableCell>
                                <TableCell className="flex-1">
                                  <span className="block text-sm">
                                    #{order.id}
                                  </span>
                                </TableCell>
                                <TableCell className="flex-1">
                                  <span className="block max-w-[200px] truncate font-medium">
                                    {order.customer_name ?? 'Sin nombre'}
                                  </span>
                                  <span className="block text-sm">
                                    {order.customer_organization ??
                                      'Sin organización'}
                                  </span>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      className={`m-2 flex inline-flex items-center rounded-lg p-2 ${order.status ? statusColors[order.status] : ''}`}
                                    >
                                      <span className="pl-2 pr-2">
                                        {order.status
                                          ?.replace(/_/g, ' ')
                                          .replace(/^\w/, (c) =>
                                            c.toUpperCase(),
                                          )}
                                      </span>
                                      <ChevronDownIcon className="flex items-center"></ChevronDownIcon>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {statuses.map((status, statusIndex) => {
                                        const camelCaseStatus = status?.replace(
                                          /_./g,
                                          (match) =>
                                            match.charAt(1).toUpperCase(),
                                        );
                                        if (!status) return null;
                                        return (
                                          <DropdownMenuItem
                                            className={`m-2 rounded-lg p-2 ${statusColors[status]} cursor-pointer`}
                                            key={status + statusIndex}
                                            onClick={() => {
                                              changeStatus.mutate({
                                                orderId: order.id,
                                                status,
                                              });
                                            }}
                                          >
                                            {t(
                                              `details.statuses.${camelCaseStatus}`,
                                            )
                                              .replace(/_/g, ' ') // Replace underscores with spaces (even though there are no underscores in the priorities array)
                                              .replace(/^\w/, (c) =>
                                                c.toUpperCase(),
                                              )}
                                          </DropdownMenuItem>
                                        );
                                      })}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <div className="flex -space-x-1">
                                    {order.assigned_to?.map((assignee) => (
                                      <Avatar
                                        key={assignee.agency_member?.email}
                                        className="h-6 max-h-6 w-6 max-w-6 border-2 border-white"
                                      >
                                        <AvatarFallback>
                                          {assignee.agency_member.name.charAt(
                                            0,
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="hidden flex-1 md:table-cell">
                                  <DatePicker
                                    updateFn={(dueDate: string) =>
                                      updateOrderDate(dueDate, order.id)
                                    }
                                    defaultDate={order.due_date}
                                  />
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="flex-1 py-10 text-center"
                            >
                              <div className="flex h-[493px] flex-col place-content-center items-center">
                                <Image
                                  src="/images/illustrations/Illustration-files.svg"
                                  alt="Illustration Card"
                                  width={220}
                                  height={160}
                                />
                                <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                                  Comencemos con tu primer pedido
                                </h3>
                                <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                                  Aún no haz creado ningún pedido, agrega uno
                                  haciendo clic a continuación.
                                </p>
                                <Button>
                                  <Link href="/orders/create">
                                    Crear pedido
                                  </Link>
                                  {/*Hay que arreglar este redirect*/}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    {filteredOrders.length ? (
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
                    ) : (
                      <></>
                    )}
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="all">
                <Card x-chunk="dashboard-06-chunk-0">
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('titleLabel')}</TableHead>
                          <TableHead>{t('idLabel')}</TableHead>
                          <TableHead>{t('clientLabel')}</TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('statusLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('assignedToLabel')}
                          </TableHead>
                          <TableHead className="hidden md:table-cell">
                            {t('dueDateLabel')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="py-2">
                        {filteredOrders.length > 0 ? (
                          filteredOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="flex-1">
                                <Link href={`/orders/${order.id}`}>
                                  <span className="block max-w-[200px] truncate font-medium">
                                    {order.title}
                                  </span>
                                </Link>
                                <span className="block max-w-[150px] truncate text-sm">
                                  {order.description ?? 'Sin descripción'}
                                </span>
                              </TableCell>
                              <TableCell className="flex-1">
                                <span className="block text-sm">
                                  #{order.id}
                                </span>
                              </TableCell>
                              <TableCell className="flex-1">
                                <span className="block max-w-[200px] truncate font-medium">
                                  {order.customer_name ?? 'Sin nombre'}
                                </span>
                                <span className="block text-sm">
                                  {order.customer_organization ??
                                    'Sin organización'}
                                </span>
                              </TableCell>
                              <TableCell className="hidden flex-1 md:table-cell">
                                <DropdownMenu>
                                  <DropdownMenuTrigger
                                    className={`m-2 flex inline-flex items-center rounded-lg p-2 ${order.status ? statusColors[order.status] : ''}`}
                                  >
                                    <span className="pl-2 pr-2">
                                      {order.status
                                        ?.replace(/_/g, ' ')
                                        .replace(/^\w/, (c) => c.toUpperCase())}
                                    </span>
                                    <ChevronDownIcon className="flex items-center"></ChevronDownIcon>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {statuses.map((status, statusIndex) => {
                                      const camelCaseStatus = status?.replace(
                                        /_./g,
                                        (match) =>
                                          match.charAt(1).toUpperCase(),
                                      );
                                      if (!status) return null;
                                      return (
                                        <DropdownMenuItem
                                          className={`m-2 rounded-lg p-2 ${statusColors[status]} cursor-pointer`}
                                          key={status + statusIndex}
                                          onClick={() => {
                                            changeStatus.mutate({
                                              orderId: order.id,
                                              status,
                                            });
                                          }}
                                        >
                                          {t(
                                            `details.statuses.${camelCaseStatus}`,
                                          )
                                            .replace(/_/g, ' ') // Replace underscores with spaces (even though there are no underscores in the priorities array)
                                            .replace(/^\w/, (c) =>
                                              c.toUpperCase(),
                                            )}
                                        </DropdownMenuItem>
                                      );
                                    })}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                              <TableCell className="hidden flex-1 md:table-cell">
                                <div className="flex -space-x-1">
                                  {order.assigned_to?.map((assignee) => (
                                    <Avatar
                                      key={assignee.agency_member?.email}
                                      className="h-6 max-h-6 w-6 max-w-6 border-2 border-white"
                                    >
                                      <AvatarFallback>
                                        {assignee.agency_member.name.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="hidden flex-1 md:table-cell">
                                <DatePicker
                                  updateFn={(dueDate: string) =>
                                    updateOrderDate(dueDate, order.id)
                                  }
                                  defaultDate={order.due_date}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="flex-1 py-10 text-center"
                            >
                              <div className="flex h-[493px] flex-col place-content-center items-center">
                                <Image
                                  src="/images/illustrations/Illustration-files.svg"
                                  alt="Illustration Card"
                                  width={220}
                                  height={160}
                                />
                                <h3 className="mb-[20px] w-[352px] text-center text-[20px] font-semibold leading-[30px] text-[#101828]">
                                  Comencemos con tu primer pedido
                                </h3>
                                <p className="mb-[16px] w-[352px] text-center text-[16px] leading-[24px] text-[#475467]">
                                  Aún no haz creado ningún pedido, agrega uno
                                  haciendo clic a continuación.
                                </p>
                                <Button>
                                  <Link href="/orders/create">
                                    Crear pedido
                                  </Link>
                                  {/*Hay que arreglar este redirect*/}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter>
                    {filteredOrders.length ? (
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
                    ) : (
                      <></>
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