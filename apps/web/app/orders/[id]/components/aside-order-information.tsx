'use client';

import { useState } from 'react';



import DatePicker from 'node_modules/@kit/team-accounts/src/server/actions/orders/pick-date/pick-date';
import { useTranslation } from 'react-i18next';

import { Separator } from '@kit/ui/separator';

import { priorityColors, statusColors } from '../utils/get-color-class-styles';
import AvatarDisplayer from './ui/avatar-displayer';
import MultiAvatarDisplayer from './ui/multi-avatar-displayer';
import SelectAction from './ui/select-action';

type Account = {
  id?: string;
  name: string;
  email: string;
  picture_url: string;
};

interface AsideOrderInformationProps {
  order: {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    created_at: string;
    assigned_to: Account[];
    client: Account;
  };
}
const AsideOrderInformation = ({ order }: AsideOrderInformationProps) => {
  const { t } = useTranslation('orders');
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [selectedPriority, setSelectedPriority] = useState(order.priority);
  const avatarsWithStatus =
    order.assigned_to?.map((account) => ({
      ...account,
      status: 'online' as 'online' | 'offline',
    })) || [];

  const changeStatus = (status: string) => {
    console.log('change', status);
    // here the server function to change the status
    setSelectedStatus(status);
  };

  const changePriority = (priority: string) => {
    console.log('changePriority', priority);
    // here the server function to change the priority
    setSelectedPriority(priority);
  };

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
        displayName={order.client.name}
        pictureUrl={order.client.picture_url}
        nickname="Deo p"
        status="online"
      />

      <Separator />
      <SelectAction
        options={statusOptions}
        groupName={t('details.status')}
        defaultValue={selectedStatus}
        className={statusColors[selectedStatus]}
        onSelectHandler={changeStatus}
      />
      <Separator />
      <SelectAction
        options={priorityOptions}
        groupName={t('details.priority')}
        defaultValue={selectedPriority}
        className={priorityColors[selectedPriority]}
        onSelectHandler={changePriority}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <span className="font-semibold">{t('details.assignedTo')}: </span>
        <MultiAvatarDisplayer avatars={avatarsWithStatus} maxAvatars={4} />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <span>{t('details.dueDate')}</span>
        <DatePicker {...order} />
      </div>
      <Separator />
    </div>
  );
};

export default AsideOrderInformation;