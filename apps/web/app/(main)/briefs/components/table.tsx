'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import type { ColumnDefBase } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';

import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

import TableSkeleton from '~/(views)/components/table/table-skeleton';
import { useTableConfigs } from '~/(views)/hooks/use-table-configs';
import EmptyState from '~/components/ui/empty-state';
import SearchInput from '~/components/ui/search-input';
import { useColumns } from '~/hooks/use-columns';
import { useDataPagination } from '~/hooks/use-data-pagination';
import type { Brief } from '~/lib/brief.types';
import { Pagination } from '~/lib/pagination';
import { handleResponse } from '~/lib/response/handle-response';
import { createBrief } from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import { getBriefs } from '~/team-accounts/src/server/actions/briefs/get/get-brief';

import Table from '../../../components/table/table';
import AddButton from './add-button';

interface ColumnDef<T> extends ColumnDefBase<T, unknown> {
  accessorKey: keyof T;
  header: string;
}

const BriefsTable = ({
  initialData,
}: {
  initialData: Pagination.Response<Brief.Relationships.Services.Response>;
}) => {
  const router = useRouter();
  const { workspace } = useUserWorkspace();
  const accountRole = workspace?.role ?? '';
  const { t } = useTranslation(['briefs', 'services']);
  const [searchTerm, setSearchTerm] = useState('');
  const { config } = useTableConfigs('table-config');

  const {
    data: briefs,
    isLoading: briefsAreLoading,
    pagination,
  } = useDataPagination<Brief.Relationships.Services.Response>({
    queryKey: ['briefs'],
    queryFn: ({ page, limit, filters }) =>
      getBriefs({
        pagination: { page, limit },
        includes: ['services'],
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

  const extendedConfig = {
    ...config,
    pagination: {
      totalCount: pagination.total,
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
      hasNextPage: pagination.hasNextPage,
      isOffsetBased: true,
      goToPage: pagination.goToPage,
      isLoadingMore: briefsAreLoading,
    },
  };

  return (
    <>
      <div className="flex flex-wrap justify-end gap-4 md:flex-nowrap relative w-full">
        <SearchInput
          placeholder={t('briefs:search')}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchTerm(e.target.value)
          }
        />

        {hasPermissionToActionBriefs() && (
          <AddButton briefMutation={briefMutation} />
        )}
      </div>
      {briefsAreLoading ? (
        <TableSkeleton columns={4} rows={4} />
      ) : briefs.length === 0 ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t('briefs:empty.title')}
          description={t('briefs:empty.description')}
          button={
            hasPermissionToActionBriefs() ? (
              <AddButton briefMutation={briefMutation} />
            ) : undefined
          }
        />
      ) : (
        <Table
          data={briefs}
          columns={briefColumns}
          filterKey="name"
          controllers={{
            search: { value: searchTerm, setValue: setSearchTerm },
          }}
          configs={extendedConfig}
        />
      )}
    </>
  );
};

export default BriefsTable;
