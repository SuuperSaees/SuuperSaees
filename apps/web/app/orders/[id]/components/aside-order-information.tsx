'use client';

import { useState } from 'react';



import { useMutation } from '@tanstack/react-query';
import DatePicker from 'node_modules/@kit/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';



import { Separator } from '@kit/ui/separator';

import { Order } from '~/lib/order.types';

import { updateOrder } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import AvatarDisplayer from './ui/avatar-displayer';
// import MultiAvatarDisplayer from './ui/multi-avatar-displayer';
import SelectAction from './ui/select-action';

interface AsideOrderInformationProps {
  order: Order.Type;
}
const AsideOrderInformation = ({ order }: AsideOrderInformationProps) => {
  const { t } = useTranslation('orders');
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [selectedPriority, setSelectedPriority] = useState(order.priority);
  // const avatarsWithStatus =
  //   order.assigned_to?.map((account) => ({
  //     ...account,
  //     status: 'online',
  //   })) ?? [];

  const changeStatus = useMutation({
    mutationFn: (status: Order.Type['status']) => {
      setSelectedStatus(status);
      return updateOrder(order.id, { status });
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Status updated successfully!',
      });
    },
    onError: () => {
      setSelectedStatus(order.status);
      toast.error('Error', {
        description: 'The status could not be updated.',
      });
    },
  });

  const changePriority = useMutation({
    mutationFn: (priority: Order.Type['priority']) => {
      setSelectedPriority(priority);
      return updateOrder(order.id, { priority });
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Priority updated successfully!',
      });
    },
    onError: () => {
      setSelectedPriority(order.priority);
      toast.error('Error', {
        description: 'The priority could not be updated.',
      });
    },
  });

  const changeDate = useMutation({
    mutationFn: (due_date: Order.Type['due_date']) => {
      return updateOrder(order.id, { due_date });
    },
    onSuccess: () => {
      console.log('date changed');
      toast.success('Success', {
        description: 'Date updated successfully!',
      });
    },
    onError: (error) => {
      console.log('error', error);
      toast.error('Error', {
        description: 'The date could not be updated.',
      });
    },
  });

  const statuses = ['pending', 'in_progress', 'completed', 'in_review'];
  const priorities = ['low', 'medium', 'high'];

  const statusOptions = statuses.map((status) => {
    const camelCaseStatus = status.replace(/_./g, (match) =>
      match.charAt(1).toUpperCase(),
    );
    return {
      value: status,
      label: t(`details.statuses.${camelCaseStatus}`)
        .replace(/_/g, ' ') // Replace underscores with spaces (even though there are no underscores in the priorities array)
        .replace(/^\w/, (c) => c.toUpperCase()),
    };
  });

  const priorityOptions = priorities.map((priority) => ({
    value: priority,
    label: t(`details.priorities.${priority}`)
      .replace(/_/g, ' ') // Replace underscores with spaces (even though there are no underscores in the priorities array)
      .replace(/^\w/, (c) => c.toUpperCase()),
  }));

  return (
    <div className="flex w-full max-w-80 flex-col gap-4 p-6 text-gray-700">
      <h3 className="font-bold">{t('details.summary')}</h3>
      <div>
        <p>{`#${order.id}`}</p>
        <p>{order.title}</p>
        <p>
          {t('details.createdAt')}:{' '}
          {new Date(order.created_at).toLocaleString()}
        </p>
      </div>
      <AvatarDisplayer
        displayName={order.client ? order.client.name : undefined}
        pictureUrl={
          order.client
            ? order.client.picture_url && order.client.picture_url
            : undefined
        }
        status="online"
      />

      <Separator />

      <SelectAction
        options={statusOptions}
        groupName={t('details.status')}
        defaultValue={selectedStatus}
        className={selectedStatus ? statusColors[selectedStatus] : undefined}
        onSelectHandler={(status) => {
          changeStatus.mutate(status as Order.Type['status']);
        }}
        disabled={changeStatus.isPending}
      />
      <Separator />
      <SelectAction
        options={priorityOptions}
        groupName={t('details.priority')}
        defaultValue={selectedPriority}
        className={
          selectedPriority ? priorityColors[selectedPriority] : undefined
        }
        onSelectHandler={(priority) => {
          changePriority.mutate(priority as Order.Type['priority']);
        }}
        disabled={changePriority.isPending}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <span className="font-semibold">{t('details.assignedTo')}: </span>
        {/* <MultiAvatarDisplayer avatars={avatarsWithStatus} maxAvatars={4} /> */}
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <span>{t('details.dueDate')}</span>
        <DatePicker updateFn={changeDate.mutate} defaultDate={order.due_date} />
      </div>
      <Separator />
    </div>
  );
};

export default AsideOrderInformation;