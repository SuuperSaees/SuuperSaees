import {
  CalendarCell,
  CalendarItem,
} from '~/(views)/calendar.types';

interface CalendarHeaderProps {
  headers: CalendarCell<CalendarItem>['headers'] | undefined;
  gridClassName: string;
}

const CalendarHeader = ({ headers, gridClassName }: CalendarHeaderProps) => {
  return (
    <div className={'grid w-full ' + gridClassName}>
      {headers?.map((header, index) => (
        <div
          key={index}
          className="flex h-fit justify-center border-e border-gray-200 px-4 py-2 last:border-none"
        >
          <h3 className="text-sm font-medium text-gray-500">{header.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default CalendarHeader;
