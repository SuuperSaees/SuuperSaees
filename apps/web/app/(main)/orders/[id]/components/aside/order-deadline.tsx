'use client';

import { CalendarIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { parseISO } from 'date-fns';
import { getFormattedDateRange } from '../../utils/get-formatted-dates';

const OrderDeadline = ({ order }) => {
  const { t, i18n } = useTranslation('orders');
  const language = i18n.language;

  return (
    <div className="mb-4 flex items-center justify-between">
      <span className="flex text-sm font-semibold">
        <CalendarIcon className="mr-2 h-4 w-4" />{' '}
        {t('details.deadline')}{' '}
      </span>
      <span className="pl-2 pr-2 text-sm items-center flex justify-center">
        {order.due_date ? (
          getFormattedDateRange(
            {from: parseISO(order.due_date), to: parseISO(order.due_date)}, 
            language, 
            true
          )
        ) : (
          t('details.deadlineNotSet', {ns: 'orders'})
        )}
      </span>
    </div>
  );
};

export default OrderDeadline;
