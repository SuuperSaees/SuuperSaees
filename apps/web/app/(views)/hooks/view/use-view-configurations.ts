import React from 'react';

import { ViewConfigurations } from '~/(views)/view-config.types';
import { ViewItem } from '~/(views)/views.types';

const useViewConfigurations = <T extends ViewItem>(
  currentConfigurations: ViewConfigurations<T> | undefined,
  setConfigurations: React.Dispatch<
    React.SetStateAction<ViewConfigurations<T> | undefined>
  >,
) => {
  const updateGroup = (groupKey: keyof T) => {
    // Logic to update the group by configuration

    setConfigurations((prevConfigs) => {
      if (prevConfigs?.viewType !== 'kanban') return prevConfigs;
      const newGroupConfig = {
        ...prevConfigs,
        group: {
          ...prevConfigs.group,
          visibility: {
            ...prevConfigs.group.visibility,
            visible: {
              ...prevConfigs.group.visibility.visible,
              options: prevConfigs.group.visibility.visible.options.filter(
                (option) => option.key == groupKey,
              ),
            },
            hidden: {
              ...prevConfigs.group.visibility.hidden,
              options: prevConfigs.group.visibility.hidden.options.filter(
                (option) => option.key == groupKey,
              ),
            },
          },
          groupBy: { ...prevConfigs.group.groupBy, selected: groupKey },
        },
      };

      return newGroupConfig;
    });
  };

  // const updateVisibility = (visibilityKey: keyof T) => {
  //   // Logic to update the visibility configuration
  //   setConfigurations((prevConfigs) => {
  //     if(!prevConfigs?.viewType) return prevConfigs;
  //     const newVisibilityConfig = {
  //       ...prevConfigs,
  //       group: {
  //         ...prevConfigs.group,
  //         visibility: {
  //           ...prevConfigs.group.visibility,
  //           visible: {
  //             ...prevConfigs.group.visibility.visible,
  //             selected: visibilityKey,
  //           },
  //         },
  //       },
  //     };
  //     return newVisibilityConfig
  //   });
  // };

  // const updateFilter = (filterKey: keyof T, filterValue: string) => {
  //   // Logic to update the filter configuration
  // };
  // const updateProperty = (propertyKey: keyof T, propertyValue: T) => {
  //   // Logic to update the property configuration
  // };
  // const updateSort: (sortKey: keyof T, sortValue: 'asc' | 'desc') => {
  //   // Logic to update the sort configuration
  // },

  return {
    updateGroup,
  };
};

export default useViewConfigurations;
