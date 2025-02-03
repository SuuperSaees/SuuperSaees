import Link from 'next/link';

import { Order } from '~/lib/order.types';
import { darkenColor, hexToRgba } from '~/utils/generate-colors';

interface CalendarCardProps {
  item: Order.Response & {
    color: string;
  };
  className?: string;
  [key: string]: unknown;
}
const CalendarCard = ({ item, className, ...rest }: CalendarCardProps) => {
  return (
    <div
      className={
        'flex h-full flex-1 gap-2 rounded-md border px-2 py-1 ' + className
      }
      style={{
        backgroundColor: hexToRgba(item?.color ?? '', 0.2) ?? 'transparent',
        borderColor: hexToRgba(item?.color ?? '', 0.2) ?? 'transparent',
      }}
      {...rest}
    >
      <Link
        href={`/orders/${item.id}`}
        className="inline-flex items-center text-xs font-medium text-inherit gap-1"
      >
        <span className="text-xs text-gray-500">#{item.id} {' · '}</span>
        <h4 style={{ color: darkenColor(item.color ?? '', 0.5) }}>
          {item.title}
        </h4>
      </Link>
    </div>
  );
};

export default CalendarCard;
