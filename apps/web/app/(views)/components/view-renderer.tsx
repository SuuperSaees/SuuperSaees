'use client';

import React from 'react';

import dynamic from 'next/dynamic';

import { useViewContext } from '../contexts/view-context';

// Dynamically import the views => this allows us to lazy load the components
const KanbanView = dynamic(() => import('./kanban/kanban-view'));
const CalendarView = dynamic(() => import('./calendar/calendar-view'));
const TableView = dynamic(() => import('./table/table-view'));
// interface ViewRendererProps<T extends ViewType> {
//   type: T; // The type can be 'kanban' or 'calendar'
//   // Define the props type based on the view type
//   props: T extends 'kanban'
//     ? KanbanViewProps<KanbanViewItem>
//     : T extends 'calendar'
//       ? CalendarViewProps<CalendarViewItem>
//       : never;
// }

const ViewRenderer = () => {
  const { viewType } = useViewContext();
  switch (viewType) {
    case 'kanban':
      return <KanbanView />;
    case 'calendar':
      return <CalendarView />;
    case 'table':
      return <TableView />;
    default:
      return null;
  }
};

export default ViewRenderer;
