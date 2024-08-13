'use client';

import { useTranslation } from 'react-i18next';

import AvatarDisplayer from './avatar-displayer';
import MultiAvatarDisplayer from './multi-avatar-displayer';

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
  const avatarsWithStatus =
    order.assigned_to?.map((account) => ({
      ...account,
      status: 'online' as 'online' | 'offline',
    })) || [];
  return (
    <div className="flex w-full max-w-80 flex-col gap-4 p-6">
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
      <p>Status: {order.status}</p>
      <p>Priority: {order.priority}</p>
      <p>Due Date: {order.due_date}</p>
      <p>
        Assigned To: <MultiAvatarDisplayer avatars={avatarsWithStatus} />
      </p>
    </div>
  );
};

export default AsideOrderInformation;
