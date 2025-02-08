'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from 'node_modules/@kit/accounts/src/components/ui/tab-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { PageBody } from '@kit/ui/page';
import { Spinner } from '@kit/ui/spinner';
import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';

import EmptyState from '~/components/ui/empty-state';
import { SkeletonTable } from '~/components/ui/skeleton';
import { useColumns } from '~/hooks/use-columns';
import { BillingAccounts } from '~/lib/billing-accounts.types';
import { Brief } from '~/lib/brief.types';
import { handleResponse } from '~/lib/response/handle-response';
import { createBrief } from '~/team-accounts/src/server/actions/briefs/create/create-briefs';

import { PageHeader } from '../../components/page-header';
import Table from '../../components/table/table';
import { TimerContainer } from '../../components/timer-container';
import { useStripeActions } from '../hooks/use-stripe-actions';

interface ServicesPageClientProps {
  accountRole: string;
  paymentsMethods: BillingAccounts.PaymentMethod[];
  stripeId: string;
  organizationId: string;
}

const TABS = [
  { key: 'services', label: 'services:serviceTitle' },
  { key: 'briefs', label: 'briefs:briefs' },
] as const;

type TabType = (typeof TABS)[number]['key'];

export function ServicesPageClient({
  accountRole,
  paymentsMethods,
  stripeId,
  organizationId,
}: ServicesPageClientProps) {
  const router = useRouter();
  const { t } = useTranslation(['briefs', 'services']);
  const searchParams = useSearchParams();
  const briefsView = searchParams.get('briefs');

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(
    briefsView === 'true' ? 'briefs' : 'services',
  );

  const { services, briefs, briefsAreLoading, servicesAreLoading } =
    useStripeActions();

  const hasPermissionToActionServices = (type?: string) => {
    switch (type) {
      case 'edit':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'delete':
        return ['agency_owner', 'agency_project_manager'].includes(accountRole);
      case 'checkout':
        return ['agency_owner'].includes(accountRole);
      default:
        return false;
    }
  };
  const hasPermissionToActionBriefs = () => {
    return ['agency_owner', 'agency_project_manager'].includes(accountRole);
  };

  const briefColumns = useColumns('briefs', {
    hasPermission: hasPermissionToActionBriefs,
  });
  const servicesColumns = useColumns('services', {
    hasPermission: hasPermissionToActionServices,
    paymentsMethods,
    stripeId,
    organizationId,
  });

  const briefMutation = useMutation({
    mutationFn: async () => {
      const res = await createBrief({});
      await handleResponse(res, 'briefs', t);
      if (res.ok && res?.success?.data) {
        router.push(`briefs/${res.success.data.id}`);
      }
    },
  });

  // Helper function para normalizar strings
  const normalizeString = (str: string | undefined | null) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  };

  const filteredData = useMemo(() => {
    const items = activeTab === 'briefs' ? briefs : services;
    const searchTermNormalized = normalizeString(searchTerm);

    return items.filter((item) => {
      if (normalizeString(item.name)?.includes(searchTermNormalized)) return true;
      
      if (activeTab === 'services') {
        if ('price' in item && item.price?.toString().includes(searchTermNormalized)) return true;
        if ('status' in item && normalizeString(item.status)?.includes(searchTermNormalized)) return true;

      }
      return false;
    });
  }, [activeTab, briefs, services, searchTerm]);

  const handleTabChange = (value: string) => {
    const newTab = value as TabType;
    setSearchTerm('');
    setActiveTab(newTab);
    if (newTab === 'services' && briefsView === 'true') {
      router.push('/services');
    }
  };

  const renderEmptyState = (accountRole: string) => (
    <EmptyState
      imageSrc="/images/illustrations/Illustration-cloud.svg"
      title={t(
        activeTab === 'services'
          ? 'startFirstService'
          : 'briefs:empty.agency.title',
      )}
      description={t(
        activeTab === 'services'
          ? 'noServicesMessage'
          : 'briefs:empty.agency.description',
      )}
      button={
        activeTab === 'services' &&
        (accountRole === 'agency_owner' ||
          accountRole === 'agency_project_manager') ? (
          <Link href="/services/create">
            <ThemedButton>{t('createService')}</ThemedButton>
          </Link>
        ) : (
          <CreateButton
            onClick={() => briefMutation.mutateAsync()}
            isLoading={briefMutation.isPending}
            label={t('createBrief')}
          />
        )
      }
    />
  );

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
      <PageBody>
        <div className="p-[35px]">
          <PageHeader
            title="services:title"
            rightContent={<TimerContainer />}
          />

          <div className="flex justify-between">
            <TabsList className="gap-2 bg-transparent">
              {TABS.map(({ key, label }) => (
                <ThemedTabTrigger
                  key={key}
                  value={key}
                  activeTab={activeTab}
                  option={key}
                  className="font-semibold hover:bg-gray-200/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
                >
                  {t(label)}
                </ThemedTabTrigger>
              ))}
            </TabsList>

            <div className="ml-auto flex items-center gap-2">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder={t(
                  activeTab === 'services' ? 'searchServices' : 'search',
                )}
              />
              {filteredData.length > 0 &&
                (accountRole === 'agency_owner' ||
                  accountRole === 'agency_project_manager') &&
                (activeTab === 'services' ? (
                  <Link href="/services/create">
                    <ThemedButton>{t('createService')}</ThemedButton>
                  </Link>
                ) : (
                  <CreateButton
                    onClick={() => briefMutation.mutateAsync()}
                    isLoading={briefMutation.isPending}
                    label={t('createBrief')}
                  />
                ))}
            </div>
          </div>

          <TabsContent className="bg-transparent" value="services">
            {servicesAreLoading && activeTab === 'services' ? (
              <SkeletonTable columns={4} rows={7} className="mt-4" />
            ) : (
              <Table
                data={activeTab === 'services' ? filteredData : []}
                columns={
                  servicesColumns as Brief.Relationships.Services.Response[]
                }
                filterKey="name"
                controllers={{
                  search: { value: searchTerm, setValue: setSearchTerm },
                }}
                emptyStateComponent={renderEmptyState(accountRole)}
              />
            )}
          </TabsContent>
          <TabsContent className="bg-transparent" value="briefs">
            {briefsAreLoading && activeTab === 'briefs' ? (
              <SkeletonTable columns={4} rows={7} className="mt-4" />
            ) : (
              <Table
                data={activeTab === 'briefs' ? filteredData : []}
                columns={
                  briefColumns as Brief.Relationships.Services.Response[]
                }
                filterKey="name"
                controllers={{
                  search: { value: searchTerm, setValue: setSearchTerm },
                }}
                emptyStateComponent={renderEmptyState(accountRole)}
              />
            )}
          </TabsContent>
        </div>
      </PageBody>
    </Tabs>
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
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      placeholder={placeholder}
      className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
    />
  </div>
);

const CreateButton = ({
  onClick,
  isLoading,
  label,
}: {
  onClick: () => Promise<void>;
  isLoading: boolean;
  label: string;
}) => (
  <ThemedButton
    onClick={onClick}
    disabled={isLoading}
    className="flex items-center gap-2"
  >
    {isLoading ? (
      <>
        <span>{label}</span>
        <Spinner className="h-4 w-4" />
      </>
    ) : (
      <span>{label}</span>
    )}
  </ThemedButton>
);