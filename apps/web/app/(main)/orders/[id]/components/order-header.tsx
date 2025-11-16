'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trans } from '@kit/ui/trans';
import { Order } from '~/lib/order.types';
import { updateOrder, logOrderActivities } from '../../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import EditableHeader from '../../../../../components/editable-header';
import { ReviewDialog } from './review-dialog';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import type { User } from '@supabase/supabase-js';
import { useActivityContext } from '../context/activity-context';

export const OrderHeader = ({
  agencyStatuses,
  user,
  userRole,
}: {
  agencyStatuses: AgencyStatus.Type[];
  user: User;
  userRole: string;
}) => {
  const { order } = useActivityContext();
  const { t } = useTranslation('responses');
  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  const handleUpdate = async (value: string) => {
    try {
      const { order: updatedOrder } = await updateOrder(order.id, { title: value });
      toast.success('Success', {
        description: t('success.orders.orderNameUpdated'),
      });
      const fields: (keyof Order.Update)[] = ['title'];
      await logOrderActivities(
        updatedOrder.id,
        updatedOrder,
        user?.id ?? '',
        user?.user_metadata?.name ?? user?.user_metadata?.email ?? '',
        undefined,
        fields
      );
    } catch (error) {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderName'),
      });
    }
  };

  const completedStatusId =
    agencyStatuses.find((s) => s.status_name === 'completed')?.id ?? null;

  const hasExistingReview = order.reviews.some(review => review.order_id === order.id);

  return (
    <div className="lg:px-6.5 lg:pt-6">
      <div className="flex flex-wrap lg:flex-nowrap items-center">
        <EditableHeader
          initialName={order.title}
          id={order.id}
          userRole={userRole}
          updateFunction={handleUpdate}
          rolesThatCanEdit={rolesThatCanEdit}
        />
        {(userRole === 'client_owner' || userRole === 'client_member') && (
          <ReviewDialog 
            orderId={order.id} 
            statusId={completedStatusId} 
            className="w-fit"
            hasExistingReview={hasExistingReview}
          />
        )}
      </div>
      <div className="flex items-center">
        <h3 className="relative mb-2 text-sm font-normal text-gray-600">
          <Trans i18nKey="details.orderId" />{order?.id}
          {order?.brief_responses?.[0]?.brief?.name && (
          <span className="text-sm"> · {order?.brief_responses?.[0]?.brief?.name}</span>
        )}
        </h3>
        
      </div>
    </div>
  );
};

export default OrderHeader;

