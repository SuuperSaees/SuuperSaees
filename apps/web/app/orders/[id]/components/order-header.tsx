'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Trans } from '@kit/ui/trans';

import { Order } from '~/lib/order.types';

import { updateOrder } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import EditableHeader from '../../../../components/editable-header';
import { useActivityContext } from '../context/activity-context';
import DeleteOrderDropdown from './delete-order-dropdown';
import { ReviewDialog } from './review-dialog';
import { AgencyStatus } from '~/lib/agency-statuses.types';

export const OrderHeader = ({ order, agencyStatuses }: { order: Order.Relational, agencyStatuses: AgencyStatus.Type[] }) => {
  const { t } = useTranslation('responses');

  const { userRole } = useActivityContext();
  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  const handleUpdate = async (value: string) => {
    try {
      await updateOrder(order.id, { title: value });
      toast.success('Success', {
        description: t('success.orders.orderNameUpdated'),
      });
    } catch (error) {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderName'),
      });
    }
  };
  const completedStatusId = agencyStatuses.find((s) => s.status_name === 'completed' )?.id ?? null;
  return (
    <div className='px-8'>
      <div className="flex flex-wrap lg:flex-nowrap items-center">
        <EditableHeader
          initialName={order.title}
          id={order.id}
          userRole={userRole}
          updateFunction={handleUpdate}
          rolesThatCanEdit={rolesThatCanEdit}
        />
        {(userRole === 'client_owner' || userRole === 'client_member') && (
          <ReviewDialog orderId={order.id} statusId={completedStatusId} className="w-fit" />
        )}
        <DeleteOrderDropdown orderId={order?.id} />
      </div>
      <div className="flex items-center">
        <h3 className="relative mb-2 text-[0.9em] text-lg font-normal text-gray-600">
          <Trans i18nKey="details.orderId" /> {order?.id}
        </h3>
      </div>
    </div>
  );
};

export default OrderHeader;
