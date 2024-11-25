
import { useTranslation } from 'react-i18next';

import { columnFactory } from '../components/table/columns';
import { EntityData } from '../components/table/types';

export const useColumns = (type: keyof EntityData) => {
  const { t } = useTranslation('tables');
  return columnFactory(type, t);
};
