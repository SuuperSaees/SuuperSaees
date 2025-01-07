'use client';

import React from 'react';

import dynamic from 'next/dynamic';

import { useViewContext } from '../contexts/view-context';
import { CalendarViewItem, KanbanViewItem } from '../types';

// Dynamically import the views => this allows us to lazy load the components
const KanbanView = dynamic(() => import('./kanban-view'));
const CalendarView = dynamic(() => import('./calendar-view'));

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
  const { data, viewType, configuration, columns } = useViewContext();
  switch (viewType) {
    case 'kanban':
      return (
        <KanbanView
          data={data as KanbanViewItem[]}
          configuration={configuration}
          columns={columns ?? []}
        />
      );
    case 'calendar':
      return (
        <CalendarView
          data={data as CalendarViewItem[]}
          configuration={configuration}
        />
      );
    default:
      return null;
  }
};

export default ViewRenderer;
