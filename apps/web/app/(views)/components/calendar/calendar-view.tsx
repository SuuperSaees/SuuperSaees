'use client';

import { useCalendarContext } from '~/(views)/contexts/calendar-context';
import { darkenColor, hexToRgba } from '~/utils/generate-colors';

const CalendarView = () => {
  const { data } = useCalendarContext() // replace with useCalendarContext

  const currentView = 'week';

  // Dummy data
  const cells = {
    headers: [
      {
        date: '2025-01-26', // Sunday
        title: 'Sun',
      },
      {
        date: '2025-01-27', // Monday
        title: 'Mon',
      },
      {
        date: '2025-01-28', // Tuesday
        title: 'Tue',
      },
      {
        date: '2025-01-29', // Wednesday
        title: 'Wed',
      },
      {
        date: '2025-01-30', // Thursday
        title: 'Thu',
      },
      {
        date: '2025-01-31', // Friday
        title: 'Fri',
      },
      {
        date: '2025-02-01', // Saturday
        title: 'Sat',
      },
    ],
    content: [
      {
        date: '2025-01-26',
        items: [],
      },
      {
        date: '2025-01-27',
        items: [
          {
            id: '1',
            title: 'Item 1',
            due_date: '2025-01-27',
            color: '#5a71e2',
          },
          {
            id: '2',
            title: 'Item 2',
            due_date: '2025-01-27',
            color: '#5a71e2',
          },
          {
            id: '3',
            title: 'Item 3',
            due_date: '2025-01-27',
            color: '#755ae2',
          },
          {
            id: '4',
            title: 'Item 4',
            due_date: '2025-01-27',
            color: '#df6e49',
          },
        ],
      },
      {
        date: '2025-01-28',
        items: [
          {
            id: '1',
            title: 'Item 1',
            due_date: '2025-01-28',
            color: '#5ee36e',
          },
        ],
      },
      {
        date: '2025-01-29',
        items: [
          {
            id: '1',
            title: 'Item 1',
            due_date: '2025-01-29',
            color: '#e35e7d',
          },
        ],
      },
      {
        date: '2025-01-30',
        items: [],
      },
      {
        date: '2025-01-31',
        items: [],
      },
      {
        date: '2025-02-01',
        items: [],
      },
    ],
  };

  const gridClassNames = {
    week: 'grid-cols-7 grid-rows-1',
    month: 'grid-cols-7 grid-rows-5',
  };

  return (
    <div className="flex h-full w-full flex-col border border-gray-200 rounded-lg">
      {/* Header */}
      <div className={'grid w-full ' + gridClassNames[currentView]}>
        {cells.headers.map((header, index) => (
          <div
            key={index}
            className="flex border-e border-gray-200 px-4 py-2 last:border-none "
          >
            <h3 className="text-sm font-medium text-gray-500">
              {header.title}
            </h3>
          </div>
        ))}
      </div>
      {/* Content */}
      <div
        className={
          'grid h-full w-full ' +
          gridClassNames[currentView]
        }
      >
        {cells.content.map((content, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 border-t border-e border-gray-200 px-4 py-2 last:border-r-none"
          >
            <div className="text-sm font-bold">
              {content.date.split('-')[2]}
            </div>
            <div className="flex flex-col gap-1">
              {content.items.map((item, index) => (
                <div key={index} className="flex gap-2 border px-2 py-1 rounded-md"
                style={{
                  backgroundColor: hexToRgba(item.color, 0.2),
                  borderColor: hexToRgba(item.color, 0.2),
                }}>
                  <h4 className="text-xs font-medium text-inherit" style={{color: darkenColor(item.color, 0.2)}}>
                    {item.title}
                  </h4>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
