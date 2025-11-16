'use client';

import React from 'react';

import dynamic from 'next/dynamic';

import { useViewContext } from '../contexts/view-context';
import KanbanSkeleton from './kanban/kanban-skeleton';
import TableSkeleton from './table/table-skeleton';
import { ViewTypeEnum } from '../views.types';

// Dynamically import the views => this allows us to lazy load the components
const KanbanView = dynamic(() => import('./kanban/kanban-view'), {
  loading: () => <KanbanSkeleton columns={5} />,
  ssr: false,
});
const CalendarView = dynamic(() => import('./calendar/calendar-view'), {
  ssr: false,
});
const TableView = dynamic(() => import('./table/table-view'), {
  loading: () => <TableSkeleton columns={9} rows={7} />,
  ssr: false,
});

const ViewRenderer = () => {
  const { viewType } = useViewContext();
  
  switch (viewType) {
    case ViewTypeEnum.Kanban:
      return <KanbanView />;
    case ViewTypeEnum.Calendar:
      return <CalendarView />;
    case ViewTypeEnum.Table:
      return <TableView />;
    default:
      return null;
  }
};

export default ViewRenderer;
