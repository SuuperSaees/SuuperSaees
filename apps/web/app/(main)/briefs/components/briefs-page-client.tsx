'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQuery } from '@tanstack/react-query';
import type { ColumnDefBase } from '@tanstack/react-table';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import { useTableConfigs } from '~/(views)/hooks/use-table-configs';
import EmptyState from '~/components/ui/empty-state';
import SearchInput from '~/components/ui/search-input';
import { useColumns } from '~/hooks/use-columns';
import type { Brief } from '~/lib/brief.types';
import { handleResponse } from '~/lib/response/handle-response';
import { createBrief } from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import { PageHeader } from '../../../components/page-header';
import Table from '../../../components/table/table';
import { TimerContainer } from '../../../components/timer-container';
import TableSkeleton from '~/(views)/components/table/table-skeleton';
import { PlusIcon } from 'lucide-react';
import WalletSummarySheet from '~/(credits)/components/wallet-summary-sheet';

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

export function BriefsPageClient() {
  const router = useRouter();
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? '';
  const { t } = useTranslation(['briefs', 'services']);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: briefs = [], isLoading: briefsAreLoading } = useQuery({
    queryKey: ['briefs'],
    queryFn: () => getBriefs({ includes: ['services'] }),
  });

  const hasPermissionToActionBriefs = () => {
    return ['agency_owner', 'agency_project_manager'].includes(accountRole);
  };

  const briefColumns = useColumns('briefs', {
    hasPermission: hasPermissionToActionBriefs,
  }) as ColumnDef<Brief.Relationships.Services.Response>[];

  const briefMutation = useMutation({
    mutationFn: async () => {
      const res = await createBrief({});
      await handleResponse(res, 'briefs', t);
      if (res.ok && res?.success?.data) {
        router.push(`briefs/${res.success.data.id}`);
      }
    },
  });

  // Helper function to normalize strings
  const normalizeString = (str: string | undefined | null) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '');
  };

  const filteredBriefs = briefs.filter((brief) => {
    const searchTermNormalized = normalizeString(searchTerm);
    return normalizeString(brief.name)?.includes(searchTermNormalized);
  });

  const createButton = (
    <ThemedButton
      onClick={() => briefMutation.mutate()}
      disabled={briefMutation.isPending}
    >
      <PlusIcon className="h-4 w-4" />
      {t('briefs:createBrief')}
    </ThemedButton>
  );
  const { config } = useTableConfigs('table-config');

  return (
    <>
      <div className="flex flex-wrap justify-between gap-4 sm:flex-nowrap">
        <PageHeader
          title="briefs:briefs"
          rightContent={<><TimerContainer /><WalletSummarySheet /></>}
          className="w-full"
        />

        <SearchInput
          placeholder={t('briefs:search')}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />

        {hasPermissionToActionBriefs() && createButton}
      </div>

      {briefsAreLoading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : filteredBriefs.length === 0 ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t('briefs:empty.title')}
          description={t('briefs:empty.description')}
          button={hasPermissionToActionBriefs() ? createButton : undefined}
        />
      ) : (
        <Table
          data={filteredBriefs}
          columns={briefColumns}
          filterKey="name"
          controllers={{
            search: { value: searchTerm, setValue: setSearchTerm },
          }}
          configs={config}
        />
      )}
    </>
  );
}
