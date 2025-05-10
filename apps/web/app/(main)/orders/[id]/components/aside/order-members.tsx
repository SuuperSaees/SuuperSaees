'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrderAgencyMembers } from '~/team-accounts/src/server/actions/orders/get/get-order';
import ActivityAssignations from '../activity-assignations';

const OrderMembers = ({ order }) => {
  const [canAddMembers, setCanAddMembers] = useState(false);
  
  const { data: orderAgencyMembers } = useQuery({
    queryKey: ['orderAgencyMembers', order?.id],
    queryFn: () =>  getOrderAgencyMembers(order?.id?.toString(), order?.agency_id?.toString()),
    enabled: !!order?.id,
  });

  return (
    <div className="mb-4">
      <ActivityAssignations
        orderId={order?.id}
        agencyId={order?.agency_id}
        canAddMembers={canAddMembers}
        orderAgencyMembers={orderAgencyMembers ?? []}
      />
    </div>
  );
};

export default OrderMembers;