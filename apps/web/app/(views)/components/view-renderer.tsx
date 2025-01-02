import React from 'react';

import dynamic from 'next/dynamic';

import {
  CalendarViewItem,
  CalendarViewProps,
  KanbanViewItem,
  KanbanViewProps,
  ViewType,
} from '../types';

// Dynamically import the views => this allows us to lazy load the components
const KanbanView = dynamic(() => import('./kanban-view'));
const CalendarView = dynamic(() => import('./calendar-view'));

interface ViewRendererProps<T extends ViewType> {
  type: T; // The type can be 'kanban' or 'calendar'
  // Define the props type based on the view type
  props: T extends 'kanban'
    ? KanbanViewProps<KanbanViewItem>
    : T extends 'calendar'
      ? CalendarViewProps<CalendarViewItem>
      : never;
}

const ViewRenderer = <T extends ViewType>({
  type,
  props,
}: ViewRendererProps<T>) => {
  switch (type) {
    case 'kanban':
      return <KanbanView {...(props as KanbanViewProps<KanbanViewItem>)} />;
    case 'calendar':
      return (
        <CalendarView {...(props as CalendarViewProps<CalendarViewItem>)} />
      );
    default:
      return null;
  }
};

export default ViewRenderer;