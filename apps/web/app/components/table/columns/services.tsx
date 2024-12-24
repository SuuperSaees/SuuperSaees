'use client';

import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { Link2, Pen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';

import Tooltip from '~/components/ui/tooltip';
import { Service } from '~/lib/services.types';
import DeleteServiceDialog from '~/services/delete/delete-component';
import { useStripeActions } from '~/services/hooks/use-stripe-actions';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { ColumnConfigs } from '../types';

export const servicesColumns = (
  t: TFunction,
  paymentsMethods: ColumnConfigs['services']['paymentsMethods'],
  hasPermission?: ColumnConfigs['services']['hasPermission'],
  stripeId?: string,
  organizationId?: string,
): ColumnDef<Service.Relationships.Billing.BillingService>[] => {
  return [
    {
      accessorKey: 'name',
      header: t('services:name'),
      cell: ({ row }) => (
        <Link
          href={`/services/${row.original.id}`}
          className="flex w-full gap-2 font-semibold"
        >
          <div className="capitalize">{row.getValue('name')}</div>
        </Link>
      ),
    },
    {
      accessorKey: 'price',
      header: t('services:price'),
      cell: ({ row }) => (
        <PriceDisplay
          price={row.getValue('price')}
          currency={row.original.currency}
          recurrence={row.original.recurrence}
        />
      ),
    },
    {
      accessorKey: 'number_of_clients',
      header: t('services:clients'),
      cell: ({ row }) => (
        <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
          {row.getValue('number_of_clients')}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('services:status'),
      cell: ({ row }) => <ServiceStatus status={row.getValue('status')} />,
    },
    {
      accessorKey: 'created_at',
      header: () => <span>{t('services:createdAt')}</span>,
      cell: ({ row }) => <DateDisplay date={row.original.created_at} />,
    },
    {
      id: 'actions',
      header: t('services:actions'),
      cell: ({ row }) => {
        return (
          <ServiceActions
            service={row.original}
            hasPermission={hasPermission}
            paymentsMethods={paymentsMethods}
            stripeId={stripeId}
            organizationId={organizationId}
          />
        );
      },
    },
  ];
};

// Separate components for better organization
const PriceDisplay = ({
  price,
  currency,
  recurrence,
}: {
  price: number;
  currency: string;
  recurrence: string | null;
}) => (
  <div className="font-sans text-sm font-normal leading-[1.42857] text-gray-600">
    ${price} {currency.toUpperCase()} {recurrence ? ` / ${recurrence}` : ''}
  </div>
);

const ServiceStatus = ({ status }: { status: string }) => {
  const { t } = useTranslation('services');
  const statusColors = {
    active: {
      background: 'bg-[#ECFDF3]',
      text: 'text-[#067647]',
      border: 'border-[#ABEFC6]',
    },
    draft: {
      background: 'bg-[#FEDF89]',
      text: 'text-[#92400E]',
      border: 'border-[#92400E]',
    },
  } as const;

  const displayStatus =
    status === 'active'
      ? t('active')
      : status === 'draft'
        ? t('draft')
        : status;

  // Add fallback styles if status is not in statusColors
  const styles = statusColors[status as keyof typeof statusColors] ?? {
    background: 'bg-transparent',
    text: 'text-black',
  };

  return <div className={`${styles.background} ${styles.text} py-1 px-2 rounded-full text-xs border w-fit font-semibold ${styles.border}`}>{displayStatus}</div>;
};

const DateDisplay = ({ date }: { date: string }) => {
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  return (
    <span className="text-sm font-medium text-gray-900">{formattedDate}</span>
  );
};

interface ServiceActionsProps {
  service: Service.Relationships.Billing.BillingService;
  paymentsMethods: ColumnConfigs['services']['paymentsMethods'];
  hasPermission?: ColumnConfigs['services']['hasPermission'];
  stripeId?: string;
  organizationId?: string;
}

function ServiceActions({
  service,
  paymentsMethods,
  hasPermission,
  stripeId,
  organizationId,
}: ServiceActionsProps) {
  const { t } = useTranslation();

  const { handleCheckout } = useStripeActions();

  return (
    <div className="flex items-center gap-4 self-stretch">
      {
        hasPermission && hasPermission('checkout') && (
          <Tooltip content={t('services:checkoutURL')}>
            <Button
              variant="ghost"
              disabled={service.billing_services.length === 0}
              className={`${service.billing_services.length === 0 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => {
                handleCheckout(service, paymentsMethods, stripeId ?? '', organizationId ?? '');
              }}
            >
              <Link2 className="h-6 w-6 cursor-pointer text-gray-600" />
            </Button>
          </Tooltip>
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
      {hasPermission && hasPermission('edit') && (
        <Tooltip content={t('services:edit')}>
          <Link
            href={`/services/update?id=${service.id}`}
            className="rounded-md p-2 hover:bg-accent"
          >
            <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
          </Link>
        </Tooltip>
      )}
      {hasPermission && hasPermission('delete') && (
        <DeleteServiceDialog serviceId={service.id} />
      )}
    </div>
  );
}

