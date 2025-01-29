'use client';

import { useCalendarContext } from '~/(views)/contexts/calendar-context';

import CalendarContent from './calendar-content';
import CalendarFooter from './calendar-footer';
import CalendarHeader from './calendar-header';

const CalendarView = () => {
  const {
    cells,
    currentView,
    currentDate,
    startDate,
    endDate,
    referenceDate,
    goToNextDate,
    goToPrevDate,
    goToCurrentDate,
    updateView,
  } = useCalendarContext(); // replace with useCalendarContext

  const gridClassNames = {
    week: {
      headers: 'grid-cols-7 grid-rows-1',
      content: 'grid-cols-7 grid-flow-row auto-rows-fr',
    },
    month: {
      headers: 'grid-cols-7 grid-rows-1',
      content: 'grid-cols-7 grid-flow-row auto-rows-fr',
    },
  };

  const viewOptions = [
    { label: 'Week view', value: 'week' },
    { label: 'Month view', value: 'month' },
  ];

  return (
    <div className="flex h-full max-h-full min-h-0 w-full flex-col rounded-xl border border-gray-200">
      {/* Header */}
      <CalendarHeader
        headers={cells?.headers}
        gridClassName={gridClassNames[currentView].headers}
      />
      {/* Content */}
      <CalendarContent
        content={cells?.content}
        gridClassName={gridClassNames[currentView].content}
      />
      {/* Footer */}
      <CalendarFooter
        currentDate={currentDate}
        referenceDate={referenceDate}
        startDate={startDate}
        endDate={endDate}
        currentView={currentView}
        viewOptions={viewOptions}
        updateView={updateView}
        goToPrevDate={goToPrevDate}
        goToCurrentDate={goToCurrentDate}
        goToNextDate={goToNextDate}
      />
    </div>
  );
};

export default CalendarView;
