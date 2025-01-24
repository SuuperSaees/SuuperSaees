'use client';

import { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';

import { ResetIcon } from '@radix-ui/react-icons';
import { ColumnDefBase } from '@tanstack/react-table';
import { ListFilter, Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { convertToTitleCase } from '~/orders/[id]/utils/format-agency-names';

import { Button } from '@kit/ui/button';
import { CustomConfigs, DataTable } from '@kit/ui/data-table';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Separator } from '@kit/ui/separator';

import { Combobox } from '~/components/ui/combobox';
import Tooltip from '~/components/ui/tooltip';

export type ControllerBarConfig = {
  filters: {
    position: number;
  };
  other: {
    position: number;
  };
  add: {
    position: number;
  };
  search: {
    position: number;
  };
};

const defaultControllerBarConfig: ControllerBarConfig = {
  filters: {
    position: 2,
  },
  other: {
    position: 1,
  },
  add: {
    position: 4,
  },
  search: {
    position: 3,
  },
};

export type ControllerBarComponentsProps = {
  search?: React.ReactNode;
  add?: React.ReactNode;
  filters?: React.ReactNode;
  other?: React.ReactNode;
  config?: ControllerBarConfig;
};

export type ControllersProps = {
  search?: {
    value: string;
    setValue: Dispatch<SetStateAction<string>>;
  };
  add?: {
    label: string;
    onAdd: () => void;
  };
};

// extende ColumnDef<T> to add accessorKey
interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filterKey: keyof T;
  withSearch?: boolean;
  controllers?: ControllersProps;
  emptyStateComponent?: React.ReactNode;
  disableInteractions?: boolean;
  className?: string;
  presetFilters?: {
    filterableColumns: (keyof T)[];
  };
  controllerBarComponents?: ControllerBarComponentsProps;
  configs?: CustomConfigs
}

export default function Table<T>({
  data,
  columns,
  controllers,
  filterKey,
  withSearch,
  emptyStateComponent,
  disableInteractions,
  className,
  presetFilters,
  controllerBarComponents,
  configs
}: TableProps<T>) {
  const [search, setSearch] = useState(controllers?.search?.value ?? '');
  const [filteredData, setFilteredData] = useState(data);
  const [activeFilters, setActiveFilters] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>,
  );

  const onFilter = (columnKey: keyof T, value: string) => {
    setActiveFilters((prevFilters) => {
      if (value === '' || prevFilters[columnKey] === value) {
        // Remove the filter if the value is empty or the same as the current filter
        const { [columnKey]: _, ...rest } = prevFilters;
        return rest as Record<keyof T, string>;
      }
      return {
        ...prevFilters,
        [columnKey]: value,
      };
    });
  };

  useEffect(() => {
    const newFilteredData = data.filter((obj) => {
      const searchString = search?.toLowerCase();
      const displayValue = String(obj[filterKey] ?? '').toLowerCase();

      // Check if the object matches all active filters
      const matchesFilters = Object.entries(activeFilters).every(
        ([key, value]) => {
          if (key === 'tags') {
            return obj.tags?.some(tagObj => 
              String(tagObj.tag?.name ?? '').includes(String(value))
            );
          }
          return String(obj[key as keyof T] ?? '').includes(String(value));
        }
      );

      return displayValue.includes(searchString) && matchesFilters;
    });
    setFilteredData(newFilteredData);
  }, [data, filterKey, search, activeFilters]);

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {presetFilters && !controllerBarComponents && (
        <PresetFilters
          columns={columns}
          data={data}
          filterableColumns={presetFilters.filterableColumns}
          onFilter={onFilter}
          activeFilters={activeFilters}
        />
      )}
      {controllerBarComponents && (
        <ControllerBar
          presetFilters={{
            columns,
            data,
            filterableColumns: presetFilters?.filterableColumns ?? [],
            onFilter,
          }}
          components={controllerBarComponents}
          activeFilters={activeFilters}
        />
      )}
      <div className="flex gap-4">
        {!controllers?.search && withSearch && (
          <div className="relative ml-auto flex w-fit flex-1 md:grow-0">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />

            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={'search...'}
              className="w-full rounded-lg bg-background pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
        )}
        {controllers?.add && (
          <ThemedButton onClick={controllers.add.onAdd}>
            {controllers.add.label}
          </ThemedButton>
        )}
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        className="rounded-xl bg-white"
        emptyStateComponent={emptyStateComponent}
        disableInteractions={disableInteractions}
        configs={configs}
      />
    </div>
  );
}

interface ControllerBarProps<T> {
  presetFilters?: {
    columns: ColumnDef<T>[];
    data: T[];
    filterableColumns: (keyof T)[];
    onFilter: (columnKey: keyof T, value: string) => void;
  };
  components: ControllerBarComponentsProps;
  activeFilters: Record<keyof T, string>;
}

export function ControllerBar<T>({
  presetFilters,
  components,
  activeFilters,
}: ControllerBarProps<T>) {
  // Default configuration in case `config` is undefined
  const config = components.config ?? defaultControllerBarConfig;

  // If presetFilters is provided and no filters component is present, use PresetFilters
  const filtersComponent =
    presetFilters && !components.filters ? (
      <PresetFilters
        columns={presetFilters.columns}
        data={presetFilters.data}
        filterableColumns={presetFilters.filterableColumns}
        onFilter={presetFilters.onFilter}
        activeFilters={activeFilters}
      />
    ) : (
      components.filters
    );

  // Map components to their respective positions, keeping `config` accessible
  const positionedComponents = Object.entries({
    ...components,
    filters: filtersComponent, // Override filters component if necessary
  })
    .filter(([key, value]) => key !== 'config' && value != null) // Ignore null/undefined values
    .map(([key, value]) => ({
      component: value as React.ReactNode,
      position: config[key as keyof ControllerBarConfig]?.position ?? Infinity,
    }))
    .sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="flex flex-wrap h-fit w-full items-center justify-end gap-4">
        {/* Render ordered components */}
        {positionedComponents.map((item, index) => (
          <Fragment key={index}>{item.component}</Fragment>
        ))}
      </div>
      <Separator />
    </>
  );
}

interface PresetFiltersProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  filterableColumns: (keyof T | 'tags')[];
  onFilter: (columnKey: keyof T | 'tags', value: string) => void;
  activeFilters: Record<string, string>;
  className?: string;
}

const PresetFilters = <T,>({
  columns,
  data,
  filterableColumns,
  onFilter,
  activeFilters,
  className,
}: PresetFiltersProps<T>) => {
  const { t } = useTranslation();

  // Helper function to check if a value is primitive
  const isPrimitive = (val: unknown) => val !== Object(val);


  const dataByColumn = filterableColumns.reduce(
    (acc, fieldKey) => {
      if (fieldKey === 'tags') {
        const allTags = data.reduce((tags: any[], item: any) => {
          if (item.tags && Array.isArray(item.tags)) {
            tags.push(...item.tags);
          }
          return tags;
        }, []);

        acc[fieldKey] = allTags
          .filter((tag: any) => tag.tag?.id && tag.tag?.name)
          .reduce((unique: any[], current: any) => {
            const exists = unique.some((item) => item.id === current.tag.id);
            if (!exists) {
              unique.push({
                id: current.tag.id,
                name: current.tag.name
              });
            }
            return unique;
          }, []);
      } else {
        acc[fieldKey] = Array.from(
          new Set(
            data
              .map((item) => item[fieldKey as keyof T])
              .filter((value) => 
                value !== null && 
                value !== undefined &&
                (isPrimitive(value) || typeof value === 'object')
              )
          )
        );
      }
      return acc;
    },
    {} as Record<keyof T, any[]>
  );
  // Function to reset all filters
  const resetFilters = () => {
    filterableColumns.forEach((columnKey) => onFilter(columnKey, ''));
  };

  return (
    <Popover>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          className="flex w-fit items-center gap-2 text-sm font-semibold text-gray-600"
        >
          <ListFilter className="h-4 w-4" />
          <span>{t('common:filters')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="relative flex flex-col gap-4 py-6">
        <Button
          variant="ghost"
          className="absolute right-4 top-2 h-6 w-6 rounded-full p-0"
          onClick={resetFilters}
        >
          <Tooltip content={t('common:resetFilters')}>
            <ResetIcon className="h-4 w-4" />
          </Tooltip>
        </Button>

        {columns
          .filter((column) => filterableColumns.includes(column.accessorKey))
          .map((column) => (
            <div
              key={String(column.accessorKey)}
              className="flex flex-col gap-2"
            >
              <span className="text-sm font-semibold text-gray-600">
                {column.header}
              </span>
              <Combobox
                options={dataByColumn[column.accessorKey]?.map((item) => ({
                  value: item,
                  // label should be the first letter uppercase and the rest lowercase also remove _ and - and replace them with a space
                  label:
                    item.charAt(0).toUpperCase() +
                    item.slice(1).replace(/(_|-)/g, ' '),
                  actionFn: () => onFilter(column.accessorKey, item),
                }))}
                className="w-full text-sm"
                defaultValue={activeFilters[column.accessorKey]}
              />
            </div>
          ))}
        {/* Add a new column for tags */}
        {
          filterableColumns.includes('tags') && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold text-gray-600">Tags</span>
              <Combobox 
                options={dataByColumn['tags']?.map((item: { id: string, name: string }) => ({
                  value: item.id,
                  label: convertToTitleCase(item.name),
                  actionFn: () => onFilter('tags', item.name),
                }))} 
                className="w-full text-sm"
                defaultValue={activeFilters.tags} 
              />
            </div>
          )
        }
      </PopoverContent>
    </Popover>
  );
};
