'use client';

import { FlagIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PriorityCombobox } from '../priority-combobox';

const OrderPriority = ({ order }) => {
  const { t } = useTranslation('orders');

  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="flex">
        <FlagIcon className="mr-2 h-4 w-4" />
        <span className="text-sm font-medium">
          {t('details.priority')}
        </span>
      </div>
      <PriorityCombobox 
        mode={'order'} 
        order={order} 
        blocked={true} 
      />
    </div>
  );
};

export default OrderPriority;
