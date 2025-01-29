import { parseISO } from 'date-fns';

import { CalendarCell, CalendarItem } from '~/(views)/calendar.types';
import { darkenColor, hexToRgba } from '~/utils/generate-colors';

interface CalendarContentProps {
  content: CalendarCell<CalendarItem>['content'] | undefined;
  gridClassName: string;
}
const CalendarContent = ({ content, gridClassName }: CalendarContentProps) => {
  return (
    <div className={'grid h-full min-h-0 w-full ' + gridClassName}>
      {content?.map((content, index) => (
        <div
          key={index}
          className={
            'last:border-r-none flex h-full flex-col gap-2 border-e border-t border-gray-200 px-4 py-2 ' +
            `${!content.isWithinCurrentMonth ? 'opacity-50' : ''}`
          }
        >
          <div
            className={
              'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ' +
              `${content.isToday ? 'bg-brand text-white' : ''}`
            }
          >
            {/* "2024-12-29T00:00:00-05:00" */}
            {parseISO(content.date).getDate()}
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto">
            {content.items.map((item, index) => (
              <div
                key={index}
                className="flex h-full flex-1 gap-2 rounded-md border px-2 py-1"
                style={{
                  backgroundColor:
                    hexToRgba(item?.color ?? '', 0.2) ?? 'transparent',
                  borderColor:
                    hexToRgba(item?.color ?? '', 0.2) ?? 'transparent',
                }}
              >
                <h4
                  className="text-xs font-medium text-inherit"
                  style={{ color: darkenColor(item.color ?? '', 0.5) }}
                >
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarContent;
