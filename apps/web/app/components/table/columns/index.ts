import { ColumnDef } from '@tanstack/react-table';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { EntityData } from '../types';
import { ordersColumns } from './orders';

export const columnFactory = <K extends keyof EntityData>(
  type: K,
  t: TFunction,
  hasPermission?: (row?: EntityData[K][number]) => boolean,
): ColumnDef<EntityData[K][number]>[] => {
  switch (type) {
    case 'orders':
      return ordersColumns(t, hasPermission);
    default:
      return [];
  }
};

export const extendColumns = <T extends EntityData>(
  baseColumns: ColumnDef<T>[],
  customColumns: ColumnDef<T>[],
): ColumnDef<T>[] => {
  return [...baseColumns, ...customColumns];
};

export * from './orders';
export * from '../types';
