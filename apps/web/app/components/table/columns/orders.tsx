'use client';

import Link from 'next/link';

import { useMutation, useQuery } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { Option } from '~/components/ui/checkbox-combobox';
import { PriorityCombobox } from '~/orders/[id]/components/priority-combobox';
import StatusCombobox from '~/orders/[id]/components/status-combobox';
import { getOrderAgencyMembers } from '~/team-accounts/src/server/actions/orders/get/get-order';
import DatePicker from '~/team-accounts/src/server/actions/orders/pick-date/pick-date';
import {
  updateOrder,
  updateOrderAssigns,
} from '~/team-accounts/src/server/actions/orders/update/update-order';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import AvatarDisplayer from '../../../components/ui/avatar-displayer';
import { MultiAvatarDropdownDisplayer } from '../../../components/ui/multiavatar-displayer';
import { EntityData } from '../types';

export const ordersColumns = (
  t: TFunction,
): ColumnDef<EntityData['orders'][number]>[] => {
  return [
    {
      accessorKey: 'title',
      header: t('orders.title'),
      cell: ({ row }) => {
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
      cell: ({ row }) => <RowAssignedTo row={row.original} />,
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

const RowAssignedTo = ({ row }: { row: EntityData['orders'][number] }) => {
  const { t } = useTranslation('orders');

  const membersAssignedSchema = z.object({
    members: z.array(z.string()),
  });

  const defaultValues = {
    members: row?.assigned_to
      ? row?.assigned_to.map((option) => option.agency_member.id)
      : [],
  };

  const {
    data: orderAgencyMembers,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['order-agency-members', row.id],
    queryFn: () => getOrderAgencyMembers(row.agency_id, row.id),
    retry: 5,
  });

  const changeAgencyMembersAssigned = useMutation({
    mutationFn: (agencyMemberIds: string[]) => {
      return updateOrderAssigns(row.id, agencyMemberIds);
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderAssigneesUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderAssigneees'),
      });
    },
  });

  function handleFormSubmit(data: z.infer<typeof membersAssignedSchema>) {
    return changeAgencyMembersAssigned.mutate(data.members);
  }

  const searchUserOptions =
    orderAgencyMembers?.map((user) => ({
      picture_url: user.user_settings?.picture_url ?? user?.picture_url ?? '',
      value: user?.id,
      label: user?.user_settings?.name ?? user?.name ?? '', // Default to empty string if null
    })) ?? [];

  const avatars =
    row?.assigned_to?.map((assignee) => ({
      name: assignee.agency_member?.settings?.name ?? assignee?.agency_member.name ?? '',
      email: assignee.agency_member?.email ?? '',
      picture_url: assignee.agency_member?.settings?.picture_url ?? assignee?.agency_member?.picture_url ?? '',
    })) ?? [];

  const CustomUserItem = ({
    option,
  }: {
    option: Option & { picture_url?: string | null };
  }) => (
    <div className="flex items-center space-x-2">
      <AvatarDisplayer
        className="font-normal"
        pictureUrl={option?.picture_url ?? ''}
        displayName={option?.label ?? ''}
      />
      <span>{option?.label}</span>
    </div>
  );
  const maxAvatars = 3;

  const CustomItemTrigger = (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-sm font-bold text-gray-600">
      +{((maxAvatars >= avatars.length)) ? '': (avatars.length - maxAvatars)}
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      <MultiAvatarDropdownDisplayer
        avatars={avatars}
        displayNormal
        avatarClassName="border-white border-[0.5px]"
        maxAvatars={maxAvatars}
        options={searchUserOptions ?? []}
        onSubmit={handleFormSubmit}
        schema={membersAssignedSchema}
        defaultValues={defaultValues}
        customItem={CustomUserItem}
        isLoading={isLoading || isPending}
        customItemTrigger={CustomItemTrigger}
      />
    </div>
  );
};
