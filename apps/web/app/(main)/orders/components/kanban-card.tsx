import Link from 'next/link';

import { Order } from '~/lib/order.types';

import PrioritySelect from '../../../components/ui/priority-select';
import MembersAssignations from '../../../components/users/member-assignations';
import { useUserOrderActions } from '../hooks/user-order-actions';
import { transformUserData } from '../utils/transform-orders-data';
import { useOrdersContext } from './context/orders-context';

interface KanbanCardProps {
  item: Order.Response;
  className?: string;
  [key: string]: unknown;
}
const KanbanCard = ({ item, className, ...rest }: KanbanCardProps) => {
  // Data
  const { agencyMembers } = useOrdersContext();
  const defaultSelectedUsers = transformUserData(item?.assigned_to);
  const users = transformUserData(agencyMembers);

  // Api actions
  const { updateOrderMutation, orderAssignsMutation } = useUserOrderActions(
    'priority',
    'success.orders.orderPriorityUpdated',
    'error.orders.failedToUpdateOrderPriority',
  );

  // Handlers
  const handleUpdatePriority = async (priority: string, orderId: number) => {
    await updateOrderMutation.mutateAsync({
      data: { priority: priority as Order.Type['priority'] },
      id: orderId,
    });
  };

  const handleUpdateAgencyAssignees = async (agencyMemberIds: string[]) => {
    await orderAssignsMutation.mutateAsync({
      agencyMemberIds: agencyMemberIds,
      orderId: item.id,
    });
  };

  return (
    <div
      className={
        'flex cursor-auto flex-col gap-2 rounded-md border border-gray-200 bg-white p-4 ' +
        className
      }
      {...rest}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between">
        <small className="max-w-14 truncate text-xs">#{item.id}</small>
        {item.priority && (
          <PrioritySelect
            priority={item.priority}
            onUpdate={(priority) => handleUpdatePriority(priority, item.id)}
          />
        )}
      </div>
      {/*Main Content */}
      <div className="flex flex-col gap-1">
        <Link
          className="line-clamp-1 text-sm font-bold font-medium text-black"
          href={`/orders/${item.id}`}
        >
          {item.title}
        </Link>
        <p className="line-clamp-2 text-sm text-xs text-gray-600">
          {item.brief?.name}
        </p>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between">
        <MembersAssignations
          users={users}
          defaultSelectedUsers={defaultSelectedUsers}
          avatarClassName="h-6 w-6 rounded-full text-xs"
          updateOrderUsersFn={handleUpdateAgencyAssignees}
        />
      </div>
    </div>
  );
};

export default KanbanCard;
