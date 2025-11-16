import { TFunction } from '../../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { priorityColors, statusColors } from './get-color-class-styles';

type DropdownOption = {
  value: string;
  label: string;
};

export function generateDropdownOptions(
  baseOptions: string[],
  t: TFunction,
  optionType: string,
): DropdownOption[] {

  const options = baseOptions.map((option) => {

    let labelBase = ''
    if(optionType == 'statuses'){
      const camelCaseStatus = option.replace(/_./g, (match) =>
        match.charAt(1).toUpperCase(),
      );
      labelBase = t(`details.${optionType}.${camelCaseStatus}`)
    }else{
      labelBase = t(`details.${optionType}.${option}`)
    }

    return {
      value: option,
      label: labelBase
        .replace(/_/g, ' ')
        .replace(/^\w/, (c) => c.toUpperCase()),
    };
  });
  return options;
}

export const getPriorityClassName = (priority: string) =>
  priorityColors[priority as 'low' | 'medium' | 'high'] ?? '';

export const getStatusClassName = (status: string) =>
  statusColors[
    status as 'pending' | 'in_progress' | 'completed' | 'in_review'
  ] ?? '';
