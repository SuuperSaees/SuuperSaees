'use client';

import { z } from 'zod';

import { Database } from '@kit/supabase/database';
import { DataTable } from '@kit/ui/enhanced-data-table';

import { AccountsTableFilters } from './filters/accounts-table-filters';
import { getAccountColumns } from './account-columns';
import { FiltersSchema } from './filters/search-input';

type Account = Database['public']['Tables']['accounts']['Row'];

export function AdminAccountsTable(
  props: React.PropsWithChildren<{
    data: Account[];
    pageCount: number;
    pageSize: number;
    page: number;
    filters: {
      type: 'all' | 'team' | 'personal';
      created_after?: string;
      query?: string;
      search_fields?: ('all' | 'name' | 'email')[];
    };
  }>,
) {
  // Add search_fields with the correct type
  const filtersWithDefaults: z.infer<typeof FiltersSchema> = {
    ...props.filters,
    search_fields: props.filters.search_fields ?? ['all'],
    query: props.filters.query ?? '',
    created_after: props.filters.created_after ?? '',
  };

  return (
    <div className="flex flex-col space-y-6">
      <AccountsTableFilters filters={filtersWithDefaults} />

      <div className="bg-white rounded-lg overflow-hidden">
        <DataTable
          pageSize={props.pageSize}
          pageIndex={props.page - 1}
          pageCount={props.pageCount}
          data={props.data}
          columns={getAccountColumns({ isPersonalAccount: true })}
        />
      </div>
    </div>
  );
}
