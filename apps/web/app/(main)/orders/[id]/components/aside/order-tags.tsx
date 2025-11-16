'use client';

import { useMutation } from '@tanstack/react-query';
import { updateOrderTags } from '~/server/actions/orders/orders.action';
import ActivityTags from '../activity-tags';

const OrderTags = ({ order, agencyTags }) => {
  
  const updateOrderTagsMutation = useMutation({
    mutationFn: (tagIds: string[]) => 
      updateOrderTags(order?.id?.toString(), tagIds),
  });

  return (
    <div className="mb-4">
      <ActivityTags
        organizationId={order?.agency_id}
        orderId={order?.id}
        updateFunction={updateOrderTagsMutation.mutate}
        searchTagOptions={agencyTags}
        canAddTags={true}
      />
    </div>
  );
};

export default OrderTags;