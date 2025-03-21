'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import type { ColumnDefBase } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { PageBody } from '@kit/ui/page';

import { useTableConfigs } from '~/(views)/hooks/use-table-configs';
import EmptyState from '~/components/ui/empty-state';
import { SkeletonTable } from '~/components/ui/skeleton';
import { useColumns } from '~/hooks/use-columns';
import type { Service } from '~/lib/services.types';

import { PageHeader } from '../../components/page-header';
import Table from '../../components/table/table';
import { TimerContainer } from '../../components/timer-container';
import { useStripeActions } from '../hooks/use-stripe-actions';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}


export function ServicesPageClient() {
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
          <Link href="/services/create">
            <ThemedButton>{t('createService')}</ThemedButton>
          </Link>
        )
      }
    />
  );

  const { config } = useTableConfigs('table-config');

  return (
    <PageBody>
      <div className="p-[35px]">
        <PageHeader title="services:title" rightContent={<TimerContainer />} />

        <div className="flex justify-between">
          <div className="ml-auto flex items-center gap-2">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t('searchServices')}
            />
            {filteredData.length > 0 &&
              (accountRole === 'agency_owner' ||
                accountRole === 'agency_project_manager') && (
                <Link href="/services/create">
                  <ThemedButton>{t('createService')}</ThemedButton>
                </Link>
              )}
          </div>
        </div>

        <div className="mt-8">
          {servicesAreLoading ? (
            <SkeletonTable columns={4} rows={7} className="mt-4" />
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
      </div>
    </PageBody>
  );
}

const SearchBar = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <div className="relative flex flex-1 md:grow-0">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <ThemedInput
      type="search"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        onChange(e.target.value)
      }
      placeholder={placeholder}
      className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
    />
  </div>
);
