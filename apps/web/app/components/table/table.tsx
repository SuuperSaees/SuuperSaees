'use client';

import { Dispatch, SetStateAction, useState } from 'react';

import { ColumnDefBase } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import { CustomConfigs, DataTable } from '@kit/ui/data-table';

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

  configs?: CustomConfigs;
}

export default function Table<T>({
  data,
  columns,
  controllers,
  withSearch,
  emptyStateComponent,
  disableInteractions,
  className,
  configs,
}: TableProps<T>) {
  const [search, setSearch] = useState(controllers?.search?.value ?? '');

  return (
    <div className={`flex flex-col ${className}`}>
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
        data={data}
        className="rounded-xl bg-white"
        emptyStateComponent={emptyStateComponent}
        disableInteractions={disableInteractions}
        configs={configs}
      />
    </div>
  );
}
