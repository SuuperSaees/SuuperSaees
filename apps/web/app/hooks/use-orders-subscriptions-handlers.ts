import { type RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { type Order } from '~/lib/order.types';
import { OrdersProviderProps } from '~/(main)/orders/components/context/orders-context.types';

/**
 * Custom hook that manages order-related event handlers and subscriptions
 * Separates the handler logic from the context provider for better maintainability
 * and potential reuse across different components
 * 
 * @param orders - Current orders state
 * @param setOrders - State setter function for orders
 * @param agencyMembers - Available agency members
 * @returns Object containing subscription handler for realtime updates
 */
export const useOrdersSubscriptionsHandlers = (
  orders: Order.Response[],
  setOrders:  (updater: Order.Response[] | ((prev: Order.Response[]) => Order.Response[])) => void,
  agencyMembers: OrdersProviderProps['agencyMembers']
) => {
  /**
   * Processes changes to order assignations, handling both additions and removals
   * Pure function that contains all assignation-related logic
   */
  const handleAssigneesChange = (
    payload: RealtimePostgresChangesPayload<Order.Assignee>
  ): boolean => {
    const { eventType, old: oldAssignations, new: newAssignations } = payload;

    // Handle removal of assignees
    if (eventType === 'DELETE') {
      const currentOrder = orders.find((order) => order.id === oldAssignations.order_id);
      if (!currentOrder?.assignations) return false;

      const updatedAssignations = currentOrder.assignations?.filter(
        (assignation) => assignation?.id !== oldAssignations.agency_member_id
      );

      setOrders((prevOrders) => 
        prevOrders.map((order) =>
          order.id === oldAssignations.order_id
            ? { ...order, assignations: updatedAssignations }
            : order
        )
      );
      return true;
    }

    // Handle addition of assignees
    if (eventType === 'INSERT') {
      const currentOrder = orders.find((order) => order.id === newAssignations.order_id);
      if (!currentOrder?.assignations) return false;

      const newAssignee = agencyMembers.find(
        (member) => member.id === newAssignations.agency_member_id
      );
      if (!newAssignee) return false;

      const updatedAssignations = [...currentOrder.assignations, newAssignee];

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === newAssignations.order_id
            ? { ...order, assignations: updatedAssignations }
            : order
        )
      );
      return true;
    }

    return false;
  };



  return {
    handleAssigneesChange,
  };
};