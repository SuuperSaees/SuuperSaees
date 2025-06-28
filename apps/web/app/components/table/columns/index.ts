import { ColumnDef } from '@tanstack/react-table';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { ColumnConfigs, EntityData } from '../types';
import { briefsColumns } from './briefs';
import { ordersColumns } from './orders';
import { servicesColumns } from './services';
import { invoicesColumns } from './invoices';

export const columnFactory = <K extends keyof EntityData>(
  type: K,
  t: TFunction,
  config: ColumnConfigs[K],
): ColumnDef<EntityData[K][number]>[] => {
  const servicesConfig = config as ColumnConfigs['services'];
  const ordersConfig = config as ColumnConfigs['orders'];
  const briefsConfig = config as ColumnConfigs['briefs'];
  const invoicesConfig = config as ColumnConfigs['invoices'];

  switch (type) {
    case 'orders':
      return ordersColumns(
        t,
        ordersConfig.data,
        ordersConfig.actions,
        ordersConfig.hasPermission,
      ) as ColumnDef<EntityData[K][number]>[];
    case 'briefs':
      return briefsColumns(t, briefsConfig.hasPermission) as ColumnDef<
        EntityData[K][number]
      >[];
    case 'services':
      return servicesColumns(
        t,
        servicesConfig.hasPermission,
      ) as ColumnDef<EntityData[K][number]>[];
    case 'invoices':
      return invoicesColumns(
        t,
        invoicesConfig.hasPermission,
      ) as ColumnDef<EntityData[K][number]>[];
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
export * from './briefs';
export * from './services';
export * from './invoices';
export * from '../types';
