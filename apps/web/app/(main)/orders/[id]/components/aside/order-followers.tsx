'use client';

import { useState } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { getOrderFollowers } from '~/server/actions/orders/orders.action';
import ActivityFollowers from '../activity-followers';

const OrderFollowers = ({ order }) => {
  const [canAddFollowers, setCanAddFollowers] = useState(false);
  
  // const { data: orderFollowers } = useQuery({
  //   queryKey: ['orderFollowers', order?.id],
  //   queryFn: () => getOrderFollowers(order?.id?.toString(), order?.agency_id?.toString()),
  //   enabled: !!order?.id,
  // });

  return (
    <div className="mb-4">
      <ActivityFollowers
        orderId={order?.id}
        agencyId={order?.agency_id}
        canAddFollowers={canAddFollowers}
        orderFollowers={[]}
      />
    </div>
  );
};

export default OrderFollowers;