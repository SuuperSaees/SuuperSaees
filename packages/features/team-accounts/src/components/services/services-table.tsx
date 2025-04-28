'use client';

import { useMemo } from 'react';
import * as React from 'react';

import Link from 'next/link';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ArrowUp, Pen, Search, Link2 } from 'lucide-react';
// import { CheckoutSelector } from './checkout-selector';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import { Separator } from '@kit/ui/separator';
import { TabsList } from '@kit/ui/tabs';

import DeleteServiceDialog from '../../../../../../apps/web/app/services/delete/delete-component';
import EmptyState from '../../../../../../apps/web/components/ui/empty-state';
import { SkeletonTable } from '../../../../../../apps/web/components/ui/skeleton';
import { Service } from '../../../../../../apps/web/lib/services.types';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from '../../../../accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from '../../../../accounts/src/components/ui/tab-themed-with-settings';
import { BillingAccounts } from '../../../../../../apps/web/lib/billing-accounts.types';
import { useStripeActions } from '../../../../../../apps/web/app/services/hooks/use-stripe-actions';

type ServicesTableProps = {
  services: Service.Relationships.Billing.BillingService[];
  activeTab: string;
  accountRole: string;
  paymentsMethods: BillingAccounts.PaymentMethod[];
  isLoading: boolean;
  stripeId: string;
  organizationId: string;
};

// SERVICES TABLE
export function ServicesTable({
  activeTab,
  services,
  accountRole,
  isLoading,
  paymentsMethods,
  stripeId,
  organizationId,
}: ServicesTableProps) {
  const { t } = useTranslation(['services', 'briefs']);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [search, setSearch] = React.useState('');

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const [rowSelection, setRowSelection] = React.useState({});

  const { handleCheckout } = useStripeActions({ userRole: accountRole });
  const columns = useGetColumns(
    t,
    accountRole,
    paymentsMethods,
    handleCheckout,
    stripeId,
    organizationId,
  );

  const filteredServices = services.filter((service) => {
    const searchString = search?.toLowerCase();
    const displayName = service?.name.toLowerCase();

    return displayName.includes(searchString);
  });


  const options = {
    data: filteredServices,
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
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 pb-[24px]">
        <TabsList className="gap-2 bg-transparent">
          <ThemedTabTrigger
            value="services"
            activeTab={activeTab}
            option={'services'}
          >
            {t('services:serviceTitle')}
          </ThemedTabTrigger>
          <ThemedTabTrigger
            value="briefs"
            activeTab={activeTab}
            option={'briefs'}
          >
            {t('briefs:briefs', { ns: 'briefs' })}
          </ThemedTabTrigger>
        </TabsList>

        <div className="flex gap-3">
          <div className="relative ml-auto flex w-fit flex-1 md:grow-0">
            <Search className="text-muted-foreground absolute right-2.5 top-2.5 h-4 w-4" />

            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={t('searchServices')}
              className="bg-background w-full rounded-lg pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          {services.length > 0 && (accountRole === 'agency_owner' || accountRole === 'agency_project_manager') ? (
            <Link href="/services/create">
              <ThemedButton>{t('creation.form.submitMessage')}</ThemedButton>
            </Link>
          ) : null}
        </div>
      </div>
      <Separator />

      {isLoading ? (
        <SkeletonTable columns={7} rows={7} className="mt-2" />
      ) : !services.length ? (
        // <div className="mt-6 flex h-full flex-col rounded-md border bg-white p-2">
          <EmptyState
            imageSrc="/images/illustrations/Illustration-cloud.svg"
            title={t('startFirstService')}
            description={t('noServicesMessage')}
            button={
              accountRole === 'agency_owner' || accountRole === 'agency_project_manager' ? (
                <Link href="/services/create">
                  <ThemedButton>{t('creation.form.submitMessage')}</ThemedButton>
                </Link>
              ) : undefined
            }
          />
        // </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredServices}
          options={options}
          className="mt-4 bg-white"
        />
      )}
    </div>
  );
}

const useGetColumns = (
  t: TFunction<'services', undefined>,
  accountRole: string,
  paymentsMethods: BillingAccounts.PaymentMethod[],
  handleCheckout: (service: Service.Relationships.Billing.BillingService, paymentMethods: BillingAccounts.PaymentMethod[], stripeId: string, organizationId?: string) => void,
  stripeId: string,
  organizationId: string,
): ColumnDef<Service.Relationships.Billing.BillingService>[] => {
  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('name'),
        cell: ({ row }) => {
          return <div className="capitalize">{row.getValue('name')}</div>;
        },
      },
      {
        accessorKey: 'price',
        header: t('price'),
        cell: ({ row }) => {
          const price = row.getValue('price');
          const currency = row.original.currency.toUpperCase();
          const recurrence = row.original.recurrence;
          return (
            <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
              ${price as number} {currency} {recurrence ? ` / ${recurrence}` : ''}
            </div>
          );
        },
      },
      // {
      //   accessorKey: 'price_id',
      //   header: 'Price ID',
      //   cell: ({ row }) => (
      //     <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
      //       {row.getValue('price_id')}
      //     </div>
      //   ),
      // },
      {
        accessorKey: 'number_of_clients',
        header: t('clients'),
        cell: ({ row }) => (
          <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
            {row.getValue('number_of_clients')}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          const status = row.getValue('status') as string;
          const displayStatus =
            status === 'active'
              ? 'Activo'
              : status === 'draft'
                ? 'En borrador'
                : status;
          return <div>{displayStatus}</div>;
        },
      },
      {
        accessorKey: 'created_at_column',
        header: ({ column }) => {
          return (
            <div>
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
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
          const service = row.original;
          return (
            <div className="h-18 flex items-center gap-4 self-stretch p-4">
               
                {
                  
                    accountRole === 'agency_owner' && (
                    <div>
                    <Button
                      variant="ghost"
                      disabled={service.billing_services.length === 0}
                      className={`${service.billing_services.length === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={() => {
                          handleCheckout(service, paymentsMethods, stripeId, organizationId);
                      }}
                    >
                      <Link2 className="h-6 w-6 cursor-pointer text-gray-600" />
                    </Button>
                  </div>
                    )
                  //   <div>
                  //   <CheckoutSelector
                  //     service={service}
                  //     paymentsMethods={paymentsMethods}
                  //     onAction={handleCheckout}
                  //   />
                  // </div>
                }

              
              {/* {accountRole === "agency_owner" && <UpdateServiceDialog valuesOfServiceStripe={service} />} */}
              {(accountRole === 'agency_owner' || accountRole === 'agency_project_manager') && (
                <Link href={`/services/update?id=${service.id}`}>
                  <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
                </Link>
              )}
              {(accountRole === 'agency_owner' || accountRole === 'agency_project_manager') && (
                <DeleteServiceDialog serviceId={service.id} />
              )}
            </div>
          );
        },
      },
    ],
    [t, accountRole, paymentsMethods],
  );
};
