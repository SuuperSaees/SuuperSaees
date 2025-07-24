'use client';

import { useState } from 'react';

import { ColumnDefBase } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import useTableConfigs from '~/(views)/hooks/use-table-configs';
import TableSkeleton from '~/../app/(views)/components/table/table-skeleton';
import PrefetcherLink from '~/../app/components/shared/prefetcher-link';
import Table from '~/../app/components/table/table';
import EmptyState from '~/components/ui/empty-state';
import SearchInput from '~/components/ui/search-input';
import { useColumns } from '~/hooks/use-columns';
import { useDataPagination } from '~/hooks/use-data-pagination';
import { Pagination } from '~/lib/pagination';
import { Service } from '~/lib/services.types';
import { getServicesByOrganizationId } from '~/server/actions/services/get-services';
interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

const ServicesTable = ({
  initialData,
}: {
  initialData: Pagination.Response<Service.Relationships.Billing.BillingService>;
}) => {
  const { t } = useTranslation(['services']);
  const [searchTerm, setSearchTerm] = useState('');
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? '';
  const { config } = useTableConfigs('table-config');

  const {
    data: services,
    isLoading: servicesAreLoading,
    pagination,
  } = useDataPagination<Service.Relationships.Billing.BillingService>({
    queryKey: ['services'],
    queryFn: ({ page, limit, filters }) =>
      getServicesByOrganizationId({
        pagination: { page, limit },
        filters: filters?.searchTerm
          ? [
              {
                field: 'name',
                operator: 'ilike',
                value: filters.searchTerm,
              },
            ]
          : undefined,
      }),
    initialData,
    config: {
      limit: config.rowsPerPage.value,
      filters: { searchTerm },
    },
  });

  const hasPermissionToActionServices = (type?: string) => {
    switch (type) {
      case 'visibility':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'edit':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'delete':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'checkout':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      default:
        return false;
    }
  };

  const servicesColumns = useColumns('services', {
    hasPermission: hasPermissionToActionServices,
  }) as ColumnDef<Service.Relationships.Billing.BillingService>[];

  const renderEmptyState = () => (
    <EmptyState
      imageSrc="/images/illustrations/Illustration-cloud.svg"
      title={t('startFirstService')}
      description={t('noServicesMessage')}
      button={
        (accountRole === 'agency_owner' ||
          accountRole === 'agency_project_manager') && (
          <PrefetcherLink href="/services/create">
            <ThemedButton>
              <PlusIcon className="h-4 w-4" />
              {t('createService')}
            </ThemedButton>
          </PrefetcherLink>
        )
      }
    />
  );

  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: servicesAreLoading,
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 justify-end relative w-full">
        <SearchInput
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
          placeholder={t('searchServices')}
          className="ml-auto"
        />

      </div>

      {servicesAreLoading ? (
        <TableSkeleton columns={6} rows={7} />
      ) : (
        <Table
          data={services}
          columns={servicesColumns}
          filterKey="name"
          controllers={{
            search: { value: searchTerm, setValue: setSearchTerm },
          }}
          emptyStateComponent={renderEmptyState()}
          configs={extendedConfig}
        />
      )}
    </div>
  );
};

export default ServicesTable;
