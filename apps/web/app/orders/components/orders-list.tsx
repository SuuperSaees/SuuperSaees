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
import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../../../packages/ui/src/shadcn/pagination';
import { statusColors } from '../[id]/utils/get-color-class-styles';


type ExtendedOrderType = Order.Type & {
  customer_name: string | null;
  customer_organization: string | null;
};

// Use the extended type
type OrdersTableProps = {
  orders: ExtendedOrderType[];
  role: string;
  updateOrderDate: (dueDate: string, orderId: number) => Promise<void>;
};



const OrdersCardTable: React.FC<OrdersTableProps> = ({ orders, role, updateOrderDate }) => {
  const { t } = useTranslation('orders');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const totalPages = Math.ceil(orders.length / rowsPerPage);

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
            {currentOrders.length > 0 ? (
              currentOrders
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
                      {['agency_member', 'agency_owner', 'agency_project_manager'].includes(role) ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className={`m-2 flex inline-flex items-center rounded-lg p-2 ${
                              order.status === 'in_progress' 
                                ? 'bg-purple-300 text-purple-700' 
                                : order.status 
                                  ? statusColors[order.status] 
                                  : ''
                            }`}
                          >
                            <span className="pl-2 pr-2">
                              {t(`details.statuses.${order.status?.replace(/_./g, (match) => match.charAt(1).toUpperCase())}`)
                                .replace(/_/g, ' ')
                                .replace(/^\w/, (c) => c.toUpperCase())}
                            </span>
                            <ChevronDownIcon className="flex items-center"></ChevronDownIcon>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {statuses.map((status, statusIndex) => {
                              const camelCaseStatus = status?.replace(/_./g, (match) => match.charAt(1).toUpperCase());
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
                                  {t(`details.statuses.${camelCaseStatus}`)
                                    .replace(/_/g, ' ')
                                    .replace(/^\w/, (c) => c.toUpperCase())}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        // Display the status or an empty space if there is no status
                        <span className="pl-2 pr-2">
                          {order.status
                            ?.replace(/_/g, ' ')
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="hidden flex-1 md:table-cell">
                      <div className="flex -space-x-1">
                        {order.assigned_to?.map((assignee) => (
                          <Avatar
                            key={assignee.agency_member.email}
                            className="h-6 max-h-6 w-6 max-w-6 border-2 border-white"
                          >
                            <AvatarImage src={assignee.agency_member.picture_url ?? ''} />
                            <AvatarFallback>
                              {assignee.agency_member.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="hidden flex-1 md:table-cell">
                      {['agency_member', 'agency_owner', 'agency_project_manager'].includes(role) ? (
                        <DatePicker
                          updateFn={(dueDate: string) =>
                            updateOrderDate(dueDate, order.id)
                          }
                          defaultDate={order.due_date}
                        />
                      ) : (
                        // Display the date or an empty space if there is no date
                        <span className="pl-2 pr-2">
                          {order.due_date ?? 'Sin fecha'}
                        </span>
                      )}
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
                      <Button className="po">{t('creation.title')}</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        {totalPages > 1 && (
          <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                className='cursor-pointer'
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Anterior
              </PaginationPrevious>
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, index) => (
              <PaginationItem key={index}>
                {index + 1 === currentPage ? (
                  <PaginationLink
                    className='cursor-pointer'
                    isActive
                  >
                    {index + 1}
                  </PaginationLink>
                ) : (
                  <PaginationLink
                    className='cursor-pointer'
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                className='cursor-pointer'
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Siguiente
              </PaginationNext>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        )}
      </CardFooter>
    </Card>
  )
}






export function OrderList({ orders, role }: OrdersTableProps) {
  const { t } = useTranslation('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('open');

  // Filter orders based on the search term
  const filteredOrders = orders.filter(order =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter orders by active tab
  const getTabFilteredOrders = (tab: string) => {
    switch (tab) {
      case 'completed':
        return filteredOrders.filter(order => order.status === 'completed');
      case 'open':
        return filteredOrders.filter(order => order.status !== 'completed' && order.status !== 'annulled');
      case 'all':
      default:
        return filteredOrders;
    }
  };

  const tabFilteredOrders = getTabFilteredOrders(activeTab);



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

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-col py-4">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <Tabs defaultValue="open" onValueChange={setActiveTab}>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <TabsList>
                <TabsTrigger value="open">{t('openOrders')}</TabsTrigger>
                <TabsTrigger value="completed">{t('completedOrders')}</TabsTrigger>
                <TabsTrigger value="all">{t('allOrders')}</TabsTrigger>
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
                    <ThemedButton>{t('creation.title')}</ThemedButton>
                  </Link>
                ) : null}
              </div>
            </div>
            <Separator />
            <div className="mt-4">
              <TabsContent value="open">
                <OrdersCardTable orders={tabFilteredOrders} role={role} updateOrderDate={updateOrderDate} />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersCardTable orders={tabFilteredOrders} role={role} updateOrderDate={updateOrderDate} />
              </TabsContent>
              <TabsContent value="all">
                <OrdersCardTable orders={tabFilteredOrders} role={role} updateOrderDate={updateOrderDate} />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
