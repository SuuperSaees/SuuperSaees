import { CalendarItem } from '~/(views)/calendar.types';
import { darkenColor, hexToRgba } from '~/utils/generate-colors';

interface CalendarCardProps {
  item: CalendarItem;
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
      <h4
        className="text-xs font-medium text-inherit"
        style={{ color: darkenColor(item.color ?? '', 0.5) }}
      >
        {item.title}
      </h4>
    </div>
  );
};

export default CalendarCard;
