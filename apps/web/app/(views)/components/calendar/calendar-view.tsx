'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';

import { CalendarView as CalendarViewType } from '~/(views)/calendar.types';
import { useCalendarContext } from '~/(views)/contexts/calendar-context';
import useCalendarDragAndDrop from '~/(views)/hooks/calendar/use-calendar-drag-n-drop';

import CalendarCard from './calendar-card';
import CalendarContent from './calendar-content';
import CalendarFooter from './calendar-footer';
import CalendarHeader from './calendar-header';

const CalendarView = () => {
  const {
    cells,
    headers,
    currentView,
    currentDate,
    startDate,
    endDate,
    referenceDate,
    customComponent,
    preferences,
    goToNextDate,
    goToPrevDate,
    goToCurrentDate,
    updateView,
    updateCells,
  } = useCalendarContext(); // replace with useCalendarContext

  const {
    handleDragEnd,
    handleDragOver,
    handleDragStart,
    collisionDetection,
    sensors,
    dragState,
    handleDragCancel,
  } = useCalendarDragAndDrop({
    cells,
    onUpdateFn: updateCells,
  });

  const { t } = useTranslation('views');

  const gridClassNames = {
    week: {
      headers: 'grid-cols-7 grid-flow-row auto-rows-fr',
      content: 'grid-cols-7 grid-flow-row auto-rows-fr',
    },
    month: {
      headers: 'grid-cols-7 grid-flow-row auto-rows-fr',
      content: 'grid-cols-7 grid-flow-row auto-rows-fr',
    },
  };

  const viewOptions = [
    { label: t('calendar.view.week'), value: 'week' },
    { label: t('calendar.view.month'), value: 'month' },
  ];
  return (
    <DndContext
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragCancel={handleDragCancel}
      sensors={sensors}
      collisionDetection={collisionDetection}
    >
      {/* Include all items of all cells in the sortable context */}
      <SortableContext
        items={cells.flatMap((cell) => cell.items.map((item) => item.id))}
      >
        <div className="flex h-full max-h-full min-h-0 w-full flex-col py-4 box-border">
          {/* Header */}
          <CalendarHeader
            headers={headers}
            gridClassName={gridClassNames[currentView].headers}
          />
          {/* Content */}
          <CalendarContent
            content={cells}
            gridClassName={gridClassNames[currentView].content}
            customComponent={customComponent}
            currentView={currentView}
            preferences={preferences}
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

        <DragOverlay className="pointer-events-none">
          {dragState?.item &&
            (customComponent?.Card ? (
              currentView === CalendarViewType.WEEK ? (
                customComponent.Card({ item: dragState.item })
              ) : currentView === CalendarViewType.MONTH ? (
                <CalendarCard item={dragState.item} />
              ) : (
                <CalendarCard item={dragState.item} />
              )
            ) : null)}
        </DragOverlay>
      </SortableContext>
    </DndContext>
  );
};

export default CalendarView;
