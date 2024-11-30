'use client';
import { DataTable } from "@kit/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { ThemedButton } from "node_modules/@kit/accounts/src/components/ui/button-themed-with-settings";
import { ThemedInput } from "node_modules/@kit/accounts/src/components/ui/input-themed-with-settings";
import { Dispatch, SetStateAction, useState } from "react";

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filterKey: keyof T;
  withSearch?: boolean;
  controllers?: {
    search: {
      value: string;
      setValue: Dispatch<SetStateAction<string>>;
    },
    add: {
      label: string;
      onAdd: () => void;

    }
  }
  emptyStateComponent?: React.ReactNode
}

export default function Table<T>({data, columns, controllers, filterKey, withSearch, emptyStateComponent}: TableProps<T>) {
  const [search, setSearch] = useState(controllers?.search?.value ?? '');

  const filteredData = data.filter((obj) => {
    const searchString = search?.toLowerCase();
    
    const displayValue = String(obj[filterKey] ?? '').toLowerCase(); // Safely access and convert to string
    return displayValue.includes(searchString);
  });

  return (
    <div className="flex flex-col gap-4">
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
    <DataTable columns={columns} data={filteredData} className="bg-white rounded-xl" emptyStateComponent={emptyStateComponent} />
  </div>
  )
}