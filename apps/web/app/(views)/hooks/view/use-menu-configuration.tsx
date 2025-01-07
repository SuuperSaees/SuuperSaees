'use client';

import { useMemo } from 'react';

import { Eye, EyeOff, Group, SquareMousePointer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import GroupList from '~/(views)/components/group-list';
import { ViewConfigurations } from '~/(views)/view-config.types';
import { ViewItem } from '~/(views)/views.types';
import { formatString } from '~/utils/text-formatter';

import { MenuItem } from '../../../components/ui/dropdown-menu';

export const useMenuConfiguration = (
  configurations: ViewConfigurations<ViewItem>,
  manageConfigurations: { updateGroup: (groupKey: keyof ViewItem) => void },
) => {
  const { t } = useTranslation('views');

  const menuConfig: MenuItem[] = useMemo(
    () => [
      {
        id: 'group-label',
        type: 'label',
        label: t('kanban.group.title'),
        icon: Group,
        onClick: () => {
          console.log('Group label clicked');
        },
      },
      {
        id: 'divider-1',
        type: 'separator',
      },
      {
        id: 'group-by',
        type: 'submenu',
        label: t('kanban.group.groupBy'),
        selectionMode: 'single',
        displaySelection: true,
        selectedOption: configurations?.group.groupBy.selected,
        icon: SquareMousePointer,
        onClick: () => {
          console.log('Group By');
        },
        items: configurations?.group.groupBy.options.map((option) => ({
          id: option,
          type: 'item',
          label: formatString(option, 'capitalize'),
          onClick: () => manageConfigurations.updateGroup(option),
        })),
      },
      {
        id: 'divider-2',
        type: 'separator',
      },
      {
        id: 'collapsible-visible-groups',
        type: 'submenu',
        label: t('kanban.group.visible'),
        icon: Eye,
        defaultOpen: true,
        content: (
          <GroupList
            groups={configurations?.group.visibility.visible.options}
            onGroupAction={configurations?.group.visibility.visible.action}
            showAll={false}
            buttonLabel={t('kanban.common.hideAll')}
          />
        ),
      },
      {
        id: 'collapsible-hidden-groups',
        type: 'submenu',
        label: t('kanban.group.hidden'),
        icon: EyeOff,
        defaultOpen: true,
        content: (
          <GroupList
            groups={configurations?.group.visibility.hidden.options}
            onGroupAction={configurations?.group.visibility.hidden.action}
            showAll={true}
            buttonLabel={t('kanban.common.showAll')}
          />
        ),
      },
    ],
    [configurations, manageConfigurations, t],
  );

  return { menuConfig };
};
