'use client';

import { useTranslation } from 'react-i18next';

import { CalendarCell, CalendarItem } from '~/(views)/calendar.types';

interface CalendarHeaderProps {
  headers: CalendarCell<CalendarItem>['headers'] | undefined;
  gridClassName: string;
}

const CalendarHeader = ({ headers, gridClassName }: CalendarHeaderProps) => {
  const { t } = useTranslation('views');
  return (
    <div
      className={
        'border-b-none grid w-full rounded-t-xl border-l border-r border-t border-gray-200 bg-white ' +
        gridClassName
      }
    >
      {headers?.map((header, index) => (
        <div
          key={index}
          className="flex h-fit justify-center border-e border-gray-200 px-4 py-2 last:border-none"
        >
          <h3 className="text-sm font-medium text-gray-500">
            {t(`calendar.date.days.${header.title.toLowerCase()}`)}
          </h3>
        </div>
      ))}
    </div>
  );
};

export default CalendarHeader;
