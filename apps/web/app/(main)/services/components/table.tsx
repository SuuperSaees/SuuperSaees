'use client';

import { useMemo, useState } from 'react';

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
import { Service } from '~/lib/services.types';

import { useStripeActions } from '../hooks/use-stripe-actions';

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

const ServicesTable = () => {
  const { t } = useTranslation(['services']);
  const [searchTerm, setSearchTerm] = useState('');
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? '';
  const { services, servicesAreLoading } = useStripeActions();

  const hasPermissionToActionServices = (type?: string) => {
    switch (type) {
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

  // Helper function to normalize strings
  const normalizeString = (str: string | undefined | null) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  };

  const filteredData = useMemo(() => {
    const searchTermNormalized = normalizeString(searchTerm);
    return services.filter((item) => {
      if (normalizeString(item.name)?.includes(searchTermNormalized))
        return true;
      if (item.price?.toString().includes(searchTermNormalized)) return true;
      if (normalizeString(item.status)?.includes(searchTermNormalized))
        return true;
      return false;
    });
  }, [services, searchTerm]);

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

  const { config } = useTableConfigs('table-config');
  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
        placeholder={t('searchServices')}
        className="ml-auto"
      />

      {servicesAreLoading ? (
        <TableSkeleton columns={6} rows={7} />
      ) : (
        <Table
          data={filteredData}
          columns={servicesColumns}
          filterKey="name"
          controllers={{
            search: { value: searchTerm, setValue: setSearchTerm },
          }}
          emptyStateComponent={renderEmptyState()}
          configs={config}
        />
      )}
    </div>
  );
};

export default ServicesTable;
