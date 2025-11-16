'use client';

import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import StatusCombobox from '../status-combobox';

const OrderStatus = ({ order, agencyStatuses }) => {
  const { t } = useTranslation('orders');

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex">
        <Loader className="mr-2 h-4 w-4" />
        <span className="text-sm font-medium">
          {t('details.status')}
        </span>
      </div>
      <StatusCombobox
        order={order}
        agency_id={order.agency_id}
        mode="order"
        blocked={true} 
      />
    </div>
  );
};

export default OrderStatus;