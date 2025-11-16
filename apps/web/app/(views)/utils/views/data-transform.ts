import {
  ViewConfigurations,
  ViewGroupByConfiguration,
  ViewInitialConfigurations,
  ViewVisiblityConfiguration,
} from '~/(views)/view-config.types';
import {
  ViewItem,
  ViewManageableProperty,
  ViewType,
} from '~/(views)/views.types';

export function createFullConfiguration<T extends ViewItem>(
  initialData: T[],
  initialViewType: ViewType,
  initialConfigurations: ViewInitialConfigurations<T>,
  availableProperties: [keyof T],
): ViewConfigurations<T> {
  // Helper function to create visibility configuration
  const createVisibilityConfig = (
    items: ViewManageableProperty[] | undefined,
    title: string,
    action: (value: ViewManageableProperty) => void,
  ): ViewVisiblityConfiguration => {

    return {
      title,
      options: items ?? [],
      action,
    };
  };

  // Helper function to create group by configuration
  const createGroupByConfig = (
    title: string,
    selected: keyof T,
    options: Array<keyof T>,
    action: (group: keyof T) => void,
  ): ViewGroupByConfiguration<T> => ({
    title,
    selected,
    options,
    action,
  });

  // Helper function to get all possible keys from data
  const getAllKeys = (data: T[]): Array<keyof T> => {
    const keysSet = new Set<keyof T>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        keysSet.add(key as keyof T);
      });
    });
    return Array.from(keysSet);
  };

  // Get all available keys from the data
  const availableKeys = getAllKeys(initialData).filter((key) =>
    availableProperties.includes(key),
  );

  // Get the selected group key
  const { group } = initialConfigurations.kanban;

  // Get visibility configurations if they exist
  const visibleColumns = group.values?.filter((col) => col.visible);
  const hiddenColumns = group.values?.filter((col) => !col.visible);

  // Create the full configuration
  const fullConfiguration: ViewConfigurations<T> = {

    viewType: initialViewType,
    group: {
      title: 'Group By',
      groupBy: createGroupByConfig(
        'Group By',
        group.selected,
        availableKeys,
        (group) => {
          group;
        },
      ),
      visibility: {
        visible: createVisibilityConfig(
          visibleColumns,
          'Visible Columns',
          (value) => {
            console.log('Toggle visibility for', value);
          },
        ),
        hidden: createVisibilityConfig(
          hiddenColumns,
          'Hidden Columns',
          (value) => {
            console.log('Toggle visibility for', value);
          },
        ),
      },
    },
    properties: {
      title: 'Properties',
      visibility: {
        visible: createVisibilityConfig(
          visibleColumns,
          'Visible Properties',
          (value) => {
            console.log('Toggle property visibility for', value);
          },
        ),
        hidden: createVisibilityConfig(
          hiddenColumns,
          'Hidden Properties',
          (value) => {
            console.log('Toggle property visibility for', value);
          },
        ),
      },
    },
    filters: {
      title: 'Filters',
      selected: group.selected,
      options: availableKeys,
      action: (filter: keyof T, value: string) => {
        console.log('Filter by', filter, 'with value', value);
      },
    },
    sort: {
      title: 'Sort',
      selected: group.selected,
      options: availableKeys,
      action: (order: 'asc' | 'desc') => {
        console.log('Sort by', order);
      },
    },
  };

  return fullConfiguration;
}
