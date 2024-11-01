'use client';

import React, { useState } from 'react';



import Link from 'next/link';
import { useRouter } from 'next/navigation';



import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { updateOrder } from 'node_modules/@kit/team-accounts/src/server/actions/orders/update/update-order';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';



import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Card, CardContent, CardFooter } from '@kit/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@kit/ui/dropdown-menu';
import { Separator } from '@kit/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@kit/ui/table';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import { Order } from '~/lib/order.types';
import { statuses } from '~/lib/orders-data';

import { ThemedButton } from '../../../../../packages/features/accounts/src/components/ui/button-themed-with-settings';
import DatePicker from '../../../../../packages/features/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../../../packages/ui/src/shadcn/pagination';
import { statusColors } from '../[id]/utils/get-color-class-styles';
import { Trans } from '@kit/ui/trans';
import EmptyState from '~/components/ui/empty-state';
import StatusCombobox from '../[id]/components/status-combobox';


type ExtendedOrderType = Order.Type & {
  customer_name: string | null;
  customer_organization: string | null;
};

// Use the extended type
type OrdersTableProps = {
  orders: ExtendedOrderType[];
  role: string;
};

type OrdersCardTableProps = {
  orders: ExtendedOrderType[];
  role: string;
  updateOrderDate: (dueDate: string, orderId: number) => Promise<void>;
};

const OrdersCardTable: React.FC<OrdersCardTableProps> = ({
  orders,
  role,
  updateOrderDate,
}) => {
  const { t } = useTranslation('orders');

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

  const totalPages = Math.ceil(orders.length / rowsPerPage);
  const router = useRouter();

  return (
    <Card x-chunk="dashboard-06-chunk-0" className='bg-transparent'>
      <CardContent>
       {
        orders.length > 0  ?
        <Table className='bg-transparent'>
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
       {
            currentOrders?.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="flex-1">
                  <Link href={`/orders/${order.id}`}>
                    <span className="block max-w-[200px] truncate font-medium">
                      {order.title}
                    </span>
                  </Link>
                  <span className="block max-w-[150px] truncate text-sm">
                    {order.customer_organization ?? 'Sin descripción'}
                  </span>
                </TableCell>
                <TableCell className="flex-1">
                  <span className="block text-sm">#{order.id}</span>
                </TableCell>
                <TableCell className="flex-1">
                  <span className="block max-w-[200px] truncate font-medium">
                    {order.customer_name ?? 'Sin nombre'}
                  </span>
                  <span className="block text-sm">
                    {order.customer_organization ?? 'Sin organización'}
                  </span>
                </TableCell>
                <TableCell className="hidden flex-1 md:table-cell">
                  {[
                    'agency_member',
                    'agency_owner',
                    'agency_project_manager',
                  ].includes(role) ? (
                    <StatusCombobox order={order} />
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
                        <AvatarImage
                          src={assignee.agency_member.picture_url ?? ''}
                        />
                        <AvatarFallback>
                          {assignee.agency_member.name
                            .charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="hidden flex-1 md:table-cell">
                  {[
                    'agency_member',
                    'agency_owner',
                    'agency_project_manager',
                  ].includes(role) ? (
                    <DatePicker
                      updateFn={(dueDate: string) =>
                        updateOrderDate(dueDate, order.id)
                      }
                      defaultDate={order.due_date}
                    />
                  ) : (
                    // Display the date or an empty space if there is no date
                    <span className="pl-2 pr-2">
                      {order.due_date ?? <Trans i18nKey="orders:details.deadlineNotSet" />}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))

          }
          
        </TableBody>
      </Table>:
      <EmptyState
          imageSrc="/images/illustrations/Illustration-files.svg"
          title={t('startFirstOrderTitle')}
          description={t('startFirstOrderDescription')}
          button={
            <Link href="/orders/create">
              <ThemedButton>{t('creation.title')}</ThemedButton>
            </Link>
          }
          />
      }
      </CardContent>
      <CardFooter>
        {totalPages > 0 && (
          <Pagination className="border-t p-4">
            <PaginationContent className="flex w-full items-center justify-between">
        
                {
                  currentPage > 1 &&
                  <PaginationItem>
                  <PaginationPrevious
                    className="cursor-pointer"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                  >
                    <Trans i18nKey={'common:pagination.previous'} />
                  </PaginationPrevious>
                           
              </PaginationItem>
                }
               
               
              
               <div className="flex flex-1 justify-center">
               {Array.from({ length: totalPages }, (_, index) => (
                <PaginationItem key={index}>
                  {index + 1 === currentPage ? (
                    <PaginationLink className="cursor-pointer" isActive>
                      {index + 1}
                    </PaginationLink>
                  ) : (
                    <PaginationLink
                      className="cursor-pointer"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}
               </div>
              {
                currentPage < totalPages &&
                <PaginationItem>
                <PaginationNext
                  className="cursor-pointer"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  <Trans i18nKey={'common:pagination.next'} />
                </PaginationNext>
              </PaginationItem>
              }
              
            </PaginationContent>
          </Pagination>
        )}
      </CardFooter>
    </Card>
  );
};

export function OrderList({ orders, role }: OrdersTableProps) {
  const { t } = useTranslation('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'open' | 'completed' | 'all'>(
    'open',
  );
  // Filtra las órdenes basadas en el término de búsqueda
  const filteredOrders = orders.filter((order) =>
    order.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Filter orders by active tab
  const getTabFilteredOrders = (tab: string) => {
    switch (tab) {
      case 'completed':
        return filteredOrders.filter((order) => order.status === 'completed');
      case 'open':
        return filteredOrders.filter(
          (order) =>
            order.status !== 'completed' && order.status !== 'annulled',
        );
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
    <div className="flex w-full flex-col">
      <div className="flex flex-col">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <Tabs
            defaultValue={activeTab}
            onValueChange={(value: string) => {
              setActiveTab(value as 'open' | 'completed' | 'all');
            }}
          >
            <div className="flex flex-wrap items-center gap-4 mb-[24px] flex items-baseline">
              <TabsList className='gap-2 bg-transparent'>
                <ThemedTabTrigger value="open" activeTab={activeTab} option={'open'}>
                  {t('openOrders')}
                </ThemedTabTrigger>
                <ThemedTabTrigger value="completed" activeTab={activeTab} option={'completed'}>
                  {t('completedOrders')}
                </ThemedTabTrigger>
                <ThemedTabTrigger value="all" activeTab={activeTab} option={'all'}>
                  {t('allOrders')}
                </ThemedTabTrigger>
              </TabsList>
              <div className="ml-auto flex items-center gap-2">
                <div className="flex relative ml-auto flex-1 md:grow-0">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <ThemedInput
                    type="search"
                    placeholder={t('searchPlaceholderTasks')}
                    className="bg-white focus-visible:ring-none w-full rounded-lg pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
                    value={searchTerm}
                    onChange={(e: {
                      target: { value: React.SetStateAction<string> };
                    }) => setSearchTerm(e.target.value)}
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
                <OrdersCardTable
                  orders={tabFilteredOrders}
                  role={role}
                  updateOrderDate={updateOrderDate}
                />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersCardTable
                  orders={tabFilteredOrders}
                  role={role}
                  updateOrderDate={updateOrderDate}
                />
              </TabsContent>
              <TabsContent value="all">
                <OrdersCardTable
                  orders={tabFilteredOrders}
                  role={role}
                  updateOrderDate={updateOrderDate}
                />
              </TabsContent>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}