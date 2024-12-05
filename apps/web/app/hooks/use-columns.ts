
import { useTranslation } from 'react-i18next';

import { columnFactory } from '../components/table/columns';
import { EntityData } from '../components/table/types';

export const useColumns = (type: keyof EntityData, hasPermission?: (row?: EntityData[keyof EntityData][number]) => boolean) => {
  const { t } = useTranslation('tables');
  return columnFactory(type, t, hasPermission);
};
