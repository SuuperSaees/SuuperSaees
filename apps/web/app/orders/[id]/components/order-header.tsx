'use client';

import { Trans } from '@kit/ui/trans';

import { Order } from '~/lib/order.types';

import { updateOrder } from '../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import EditableHeader from '../../../../components/editable-header';
import { useActivityContext } from '../context/activity-context';
import DeleteOrderDropdown from './delete-order-dropdown';

export const OrderHeader = ({ order }: { order: Order.Relational }) => {
  const { userRole } = useActivityContext();
  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  return (
    <div>
      <EditableHeader
        initialName={order.title}
        id={order.id}
        userRole={userRole}
        updateFunction={(id, data) => updateOrder(id as Order.Type['id'], data)}
        rolesThatCanEdit={rolesThatCanEdit}
        label="Order title"
        fieldName="title"
      />
      <div className='flex items-center'>
        <h3 className="relative mb-2">
          <Trans i18nKey="details.orderId" /> {order?.id}
        </h3>
        <DeleteOrderDropdown orderUuid = {order.uuid} />
      </div>
      
    </div>
  );
};

export default OrderHeader;
