'use client';

import { useState } from 'react';
import type { ColumnDefBase } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import TableSkeleton from '~/(views)/components/table/table-skeleton';
import { useTableConfigs } from '~/(views)/hooks/use-table-configs';
import EmptyState from '~/components/ui/empty-state';
import SearchInput from '~/components/ui/search-input';
import { useColumns } from '~/hooks/use-columns';
import { useDataPagination } from '~/hooks/use-data-pagination';
import type { Invoice } from '~/lib/invoice.types';
import { Pagination } from '~/lib/pagination';

import Table from '../../../components/table/table';
import { getInvoices } from '~/server/actions/invoices/invoices.action';
import AddButton from './add-button';

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}


const InvoicesTable = ({
  initialData,
  queryKey = ['invoices'],
  queryFn,
}: {
  initialData?: Pagination.Response<Invoice.Response>;
  queryKey: string[];
  queryFn?: () => Promise<Pagination.Response<Invoice.Response>>;
}) => {
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? '';
  const { t } = useTranslation(['invoices']);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { config } = useTableConfigs('table-config');
  
  const {
    data: invoices,
    isLoading: invoicesAreLoading,
    pagination,
  } = useDataPagination<Invoice.Response>({
    queryKey,
    queryFn: queryFn ?? (({ page, limit, filters }) =>
      getInvoices({
        pagination: { page, limit },
        filters: filters?.searchTerm
          ? { searchTerm: filters.searchTerm }
          : undefined,
      })),
    initialData,
    config: {
      limit: config.rowsPerPage.value,
      filters: searchTerm ? ({ searchTerm: searchTerm } as { searchTerm: string }) : undefined,
    },
  });

  const hasPermissionToActionInvoices = (type?: string) => {
    switch (type) {
      case 'create':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'download':
        return ['agency_owner', 'agency_project_manager', 'client_owner', 'client_member'].includes(accountRole);
      case 'view':
        return ['agency_owner', 'agency_project_manager', 'client_owner', 'client_member'].includes(accountRole);
      case 'edit':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'delete':
        return ['agency_owner'].includes(accountRole);
      case 'markAsPaid':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'requestPayment':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'getPaymentLink':
        return ['agency_owner', 'agency_project_manager', 'client_owner', 'client_member'].includes(accountRole);
      default:
        return false;
    }
  };

  const invoiceColumns = useColumns('invoices', {
    hasPermission: hasPermissionToActionInvoices,
  }) as ColumnDef<Invoice.Response>[];

  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: invoicesAreLoading,
    },
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap w-full justify-end gap-4 md:flex-nowrap ml-auto md:w-fit relative">
        <SearchInput
          placeholder={t('invoices:search')}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />
        {hasPermissionToActionInvoices('create') && (
          <AddButton />
        )}
      </div>
      {invoicesAreLoading ? (
        <TableSkeleton columns={6} rows={4} />
      ) : invoices.length === 0 ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t('invoices:empty.title')}
          description={t('invoices:empty.description')}
        />
      ) : (
        <Table
          data={invoices}
          columns={invoiceColumns}
          filterKey="number"
          controllers={{
            search: { value: searchTerm, setValue: setSearchTerm },
          }}
          configs={extendedConfig}
        />
      )}
    </div>
  );
};

export default InvoicesTable;