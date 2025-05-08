'use client';

import { Dispatch, SetStateAction } from 'react';

import { Order } from '~/lib/order.types';

import { useUserOrderActions } from './user-order-actions';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { ViewManageableProperty } from '~/(views)/views.types';

interface UseOrdersActionHandlerProps {
  orders: Order.Response[];
  setOrders: Dispatch<SetStateAction<Order.Response[]>>;
  agencyId?: Order.Type['agency_id'];
  statuses: AgencyStatus.Type[];
  queryKey: string[];
}

const useOrdersActionHandler = ({ agencyId, queryKey }: UseOrdersActionHandlerProps) => {
  const { updateOrderMutation } = useUserOrderActions(
    'status',
    undefined,
    undefined,
    queryKey,
  );


  const handleUpdateOrder = async (
    data: Order.Response,
    property?: string,
    targetOrderId?: Order.Type['id'],
    propertyData?: ViewManageableProperty
  ) => {
    try {
      const updateValue = property
        ?  property=== 'status' ? {
          status: data[property as keyof Order.Response],
          status_id: propertyData?.id,
        } :{
            [property as keyof Order.Response]:
              data[property as keyof Order.Response],
          }
        : data;
      // await updateOrder(data.id, updateValue);
      await updateOrderMutation.mutateAsync({
        data: updateValue,
        id: data.id,
        agencyId,
        targetOrderId,
      });
    } catch (error) {
      console.error('Error updating orders data:', error);
    }
  };
  return {
    handleUpdateOrder,
  };
};

export default useOrdersActionHandler;
