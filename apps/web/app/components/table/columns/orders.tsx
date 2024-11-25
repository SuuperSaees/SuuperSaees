import Link from 'next/link';

import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { toast } from 'sonner';

import { PriorityCombobox } from '~/orders/[id]/components/priority-combobox';
import StatusCombobox from '~/orders/[id]/components/status-combobox';
import DatePicker from '~/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { updateOrder } from '~/team-accounts/src/server/actions/orders/update/update-order';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import MultiAvatarDisplayer from '../../../components/ui/multiavatar-displayer';
import { EntityData } from '../types';

export const ordersColumns = (
  t: TFunction,
): ColumnDef<EntityData['orders'][number]>[] => {
  return [
    {
      accessorKey: 'title',
      header: t('orders.title'),
      cell: ({ row }) => {
        console.log('row', row.original);
        return (
          <Link
            href={`/orders/${row.original.id}`}
            className="flex w-fit gap-2"
          >
            <div className="flex flex-col">
              <span className="font-semibold">{row.original.title}</span>
              <span className="text-sm text-gray-600">
                {row.original?.brief?.name}
              </span>
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: 'id',
      header: t('orders.id'),
      cell: ({ row }) => (
        <span className="text-gray-600">#{row.original.id}</span>
      ),
    },
    {
      accessorKey: 'client',
      header: t('orders.client'),
      cell: ({ row }) => {
        return (
          <Link
            href={`/clients/organizations/${row.original.client_organization?.id}`}
            className="flex flex-col"
          >
            <span className="font-semibold">{row.original.customer?.name}</span>
            <span className="text-sm text-gray-600">
              {row.original.client_organization?.name}
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('orders.status'),
      cell: ({ row }) => {
        return (
          <StatusCombobox
            order={row.original}
            agency_id={row.original.agency_id}
            mode="order"
          />
        );
      },
    },
    {
      accessorKey: 'priority',
      header: t('orders.priority'),
      cell: ({ row }) => {
        return <PriorityCombobox mode="order" order={row.original} />;
      },
    },
    {
      accessorKey: 'assigned_to',
      header: t('orders.assignedTo'),
      cell: ({ row }) => {
        const avatars =
          row?.original?.assigned_to?.map((assignee) => ({
            name: assignee.agency_member.name ?? '',
            email: assignee.agency_member.email ?? '',
            picture_url: assignee.agency_member.picture_url,
          })) ?? [];
        return (
          <MultiAvatarDisplayer
            avatars={avatars}
            displayNormal
            avatarClassName="border-white border-[0.5px]"
            maxAvatars={3}
          />
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('orders.createdAt'),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-gray-500">
            {formatDate(row.original?.created_at, 'PP')}
          </span>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: t('orders.updatedAt'),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-gray-500">
            {row.original?.updated_at &&
              formatDate(row.original?.updated_at, 'PP')}
          </span>
        );
      },
    },

    {
      accessorKey: 'due_date',
      header: t('orders.dueDate'),
      cell: ({ row }) => {
        const updateOrderDate = async (due_date: string, orderId: number) => {
          try {
            await updateOrder(orderId, { due_date });
            toast('Success!', {
              description: t('success.orders.orderDateUpdated'),
            });
          } catch (error) {
            toast('Error', {
              description: t('error.orders.failedToUpdateOrderDate'),
            });
          }
        };
        return (
          <DatePicker
            updateFn={(dueDate: string) =>
              updateOrderDate(dueDate, row.original.id)
            }
            defaultDate={row?.original?.due_date}
            showIcon
          />
        );
      },
    },
  ];
};
