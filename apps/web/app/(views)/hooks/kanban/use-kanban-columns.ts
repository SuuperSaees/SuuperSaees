import { useCallback } from 'react';

import {
  KanbanColumn,
  KanbanItem,
  KanbanUpdateFunction,
} from '~/(views)/kanban.types';
import { createColumnsByGroup } from '~/(views)/utils/kanban/data-transform';
import { UpdateFunction, ViewManageableProperty } from '~/(views)/views.types';

const useKanbanColumns = <T extends KanbanItem>(
  columns: KanbanColumn[],
  setColumns: React.Dispatch<React.SetStateAction<KanbanColumn[]>>,
  onUpdateFn?: UpdateFunction,
) => {
  // column actioners

  const updateColumnsByGroup = useCallback(
    (
      data: T[],
      newGroupKey: keyof T,
      updatedGroupValues?: ViewManageableProperty[],
    ) => {
      return createColumnsByGroup(newGroupKey, data, updatedGroupValues);
    },
    [], // Only depends on `data`, as `groupKey` and `groupValues` are passed as arguments
  );
  // Helper function to update item position based on the moved item
  const updateColumnItems = useCallback(
    (column: KanbanColumn, updatedItemId: KanbanItem['id']) => {
      const newGroupKey = column.key;
      const newItemGroupType = column.type;

      // Reposition the item in the new group and update the group type
      const updatedItems = column.items.map((item, index) => {
        if (item.id === updatedItemId) {
          return {
            ...item,
            position: index,
            [newItemGroupType]: newGroupKey,
          };
        }
        return item;
      });
      return updatedItems;
    },
    [],
  );
  // Helper to update column positions consistently
  const updateColumns = useCallback(
    (
      columns: KanbanColumn[],
      isZeroIndexed = true,
      itemId?: KanbanItem['id'],
    ): KanbanColumn[] => {
      return columns.map((column, index) => ({
        ...column,
        position: isZeroIndexed ? index : index + 1,
        count: {
          total: column.items.length,
        },
        items: itemId ? updateColumnItems(column, itemId) : column.items,
      }));
    },
    [updateColumnItems],
  );

  // Function to update columns based on the moved columns
  const handleUpdateColumns: KanbanUpdateFunction = useCallback(
    async ({ column, columns, item, updatedType }, executeMuatation = true) => {
      try {
        const updatedColumns = updateColumns(columns, false, item?.id);
        setColumns(updatedColumns);
        // console.log('column to update', column);
        // console.log('item to update', item);
        const newItem = {
          ...item,
          [column?.type as string]: column?.key,
        };
        const newValueToUpdate =
          updatedType === 'column' && column && item
            ? column
            : updatedType === 'item' && item && column
              ? newItem
              : null;
        onUpdateFn &&
          executeMuatation &&
          newValueToUpdate &&
          (await onUpdateFn<T>(newValueToUpdate as T, column?.type as keyof T));
      } catch (error) {
        console.error('Error updating columns:', error);
      }
    },
    [onUpdateFn, setColumns, updateColumns],
  );
  return {
    updateColumnsByGroup,
    updateColumns,
    handleUpdateColumns,
    createColumnsByGroup,
  };
};

export default useKanbanColumns;
