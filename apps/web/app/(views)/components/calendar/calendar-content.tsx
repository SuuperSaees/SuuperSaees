import { parseISO } from 'date-fns';

import {
  CalendarCell,
  CalendarItem,
  CalendarView,
} from '~/(views)/calendar.types';
import { ViewPreferences } from '~/(views)/view-config.types';
import { ViewCustomComponents } from '~/(views)/views.types';
import { getContrastColor } from '~/utils/generate-colors';

import Droppable from '../../../components/droppable-container';
import SortableItem from '../../../components/sortable-item';
import CalendarCard from './calendar-card';

interface CalendarContentProps {
  content: CalendarCell<CalendarItem>['content'] | undefined;
  gridClassName: string;
  currentView: CalendarView;
  customComponent?: ViewCustomComponents<CalendarItem>['calendar'];
  preferences?: ViewPreferences;
}

const CalendarContent = ({
  content,
  gridClassName,
  customComponent: CustomComponent,
  preferences,
  currentView,
}: CalendarContentProps) => {
  return (
    <div
      className={
        'grid h-full min-h-0 w-full border-s border-gray-200 ' + gridClassName
      }
    >
      {content?.map((content) => (
        <Droppable
          id={content.date}
          key={'calendar-content-' + content.date}
          data={{ id: content.date, date: content.date }}
        >
          <div
            className={[
              'last:border-r-none flex h-full flex-col gap-2 border-e border-t border-gray-200 px-4 py-2',
              !content.isWithinCurrentMonth ? 'opacity-50' : '',
              content.isWeekend ? 'bg-muted' : 'bg-gray-50'
            ].filter(Boolean).join(' ')}
          >
            <div
              className={
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ' +
                `${content.isToday ? 'bg-brand text-white' : ''}`
              }
              style={
                preferences?.interfaceColors?.primary && content.isToday
                  ? {
                      backgroundColor: preferences?.interfaceColors?.primary,
                      color: getContrastColor(
                        preferences?.interfaceColors?.primary,
                      ),
                    }
                  : undefined
              }
            >
              {parseISO(content.date).getDate()}
            </div>

            <div className="no-scrollbar flex flex-col gap-1 overflow-y-auto">
              {content.items.map((item, index) =>
                CustomComponent?.Card && currentView === CalendarView.WEEK ? (
                  <SortableItem
                    id={item.id}
                    key={'calendar-item-' + item.id}
                    data={{ item, date: content.date }}
                    overlayClassName="rounded-md bg-transparent"
                    styleOnDrag={{ opacity: 0 }}
                    className="h-full"
                  >
                    {CustomComponent.Card({ item, index })}
                  </SortableItem>
                ) : currentView === CalendarView.MONTH ? (
                  <SortableItem
                    id={item.id}
                    key={'calendar-item-' + item.id}
                    data={{ item, date: content.date }}
                    overlayClassName="rounded-md bg-transparent"
                    styleOnDrag={{ opacity: 0 }}
                    className="h-full"
                  >
                    {CustomComponent?.CardMonth({ item, index })}
                  </SortableItem>
                ) : (
                  <SortableItem
                    id={item.id}
                    key={'calendar-item-' + item.id}
                    data={{ item, date: content.date }}
                    overlayClassName="rounded-md bg-transparent"
                    styleOnDrag={{ opacity: 0 }}
                    className="h-full"
                  >
                    <CalendarCard item={item} key={index} />
                  </SortableItem>
                ),
              )}
            </div>
          </div>
        </Droppable>
      ))}
    </div>
  );
};

export default CalendarContent;
