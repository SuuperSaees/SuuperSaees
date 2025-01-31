import { parseISO } from 'date-fns';

import { CalendarCell, CalendarItem, CalendarView } from '~/(views)/calendar.types';
import { ViewCustomComponents } from '~/(views)/views.types';

import CalendarCard from './calendar-card';

interface CalendarContentProps {
  content: CalendarCell<CalendarItem>['content'] | undefined;
  gridClassName: string;
  currentView: CalendarView;
  customComponent?: ViewCustomComponents<CalendarItem>['calendar'];
}
const CalendarContent = ({
  content,
  gridClassName,
  customComponent: CustomComponent,
  currentView,
}: CalendarContentProps) => {
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
          <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
            {content.items.map((item, index) =>
              CustomComponent?.Card && currentView === CalendarView.WEEK ? (
                CustomComponent.Card({ item, index })
              ) : (
                <CalendarCard item={item} key={index} />
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarContent;
