'use client';

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
  setData: React.Dispatch<React.SetStateAction<KanbanItem[]>>,
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
    (
      column: KanbanColumn,
      updatedItemId: KanbanItem['id'],
      isZeroIndexed = false,
    ) => {
      const newGroupKey = column.key;
      const newItemGroupType = column.type;

      // Reposition the item in the new group and update the group type
      const updatedItems = column.items.map((item, index) => {
        return {
          ...item,
          position: isZeroIndexed ? index : index + 1,
          [newItemGroupType]:
            item.id === updatedItemId ? newGroupKey : item[newItemGroupType],
          column: newGroupKey,
        };
      });
      return updatedItems;
    },
    [],
  );
  // Helper to update column positions consistently
  const updateColumns = useCallback(
    (
      columns: KanbanColumn[],
      isZeroIndexed = false,
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
    async (
      { column, columns, item, targetItem, updatedType },
      executeMuatation = true,
    ) => {
      try {
        const updatedColumns = updateColumns(columns, false, item?.id);
        const updatedItems = updatedColumns.reduce(
          (acc: KanbanItem[], curr) => [...acc, ...curr.items] as KanbanItem[],
          [],
        );
        setColumns(updatedColumns);
        executeMuatation && setData(updatedItems);

        // Extract all the items from each column and add to a single array
        const newColumn = updatedColumns.find((col) => col.id === column?.id);
        let newItem = newColumn?.items.find((i) => i.id === item?.id);

        newItem = newItem
          ? {
              ...newItem,
              [column?.type as string]: column?.key,
            }
          : undefined;
        const newValueToUpdate =
          updatedType === 'column' && newColumn && newItem
            ? newColumn
            : updatedType === 'item' && newItem && newColumn
              ? newItem
              : null;
        
        const propertyData: ViewManageableProperty | undefined = newColumn?.type === 'status' ? {
          id: newColumn?.id,
          key: newColumn?.key,
          name: newColumn?.name,
          position: newColumn?.position,
          visible: newColumn?.is_visible,
        }: undefined;

        onUpdateFn &&
          executeMuatation &&
          newValueToUpdate &&
          (await onUpdateFn<T>(
            newValueToUpdate as T,
            newColumn?.type as keyof T,
            targetItem?.id,
            propertyData
          ));
      } catch (error) {
        console.error('Error updating columns:', error);
      }
    },
    [onUpdateFn, setColumns, updateColumns, setData],
  );
  return {
    updateColumnsByGroup,
    updateColumns,
    handleUpdateColumns,
    createColumnsByGroup,
  };
};

export default useKanbanColumns;
