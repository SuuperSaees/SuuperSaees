import { useTranslation } from 'react-i18next';
import { columnFactory, ColumnConfigs } from '../components/table/columns';
import { EntityData } from '../components/table/types';
import { useMemo } from 'react';

export const useColumns = <K extends keyof EntityData>(
  type: K,
  config: ColumnConfigs[K]
) => {
  const { t } = useTranslation('tables');
  return useMemo(() => columnFactory(type, t, config), [type, t, config]);
};
