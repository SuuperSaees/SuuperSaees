'use client';

import { useMemo } from 'react';
import * as React from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { ArrowUp, Copy, Pen, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { DataTable } from '@kit/ui/data-table';
import { Separator } from '@kit/ui/separator';
import { Spinner } from '@kit/ui/spinner';
import { TabsList } from '@kit/ui/tabs';

import EmptyState from '../../../../../../apps/web/components/ui/empty-state';
import { SkeletonTable } from '../../../../../../apps/web/components/ui/skeleton';
import Tooltip  from  "../../../../../../apps/web/components/ui/tooltip";
import { Brief } from '../../../../../../apps/web/lib/brief.types';
import { handleResponse } from '../../../../../../apps/web/lib/response/handle-response';
import type { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from '../../../../accounts/src/components/ui/input-themed-with-settings';
import { ThemedTabTrigger } from '../../../../accounts/src/components/ui/tab-themed-with-settings';
import {
  createBrief,
  duplicateBrief,
} from '../../server/actions/briefs/create/create-briefs';
import DeleteBriefDialog from '../../server/actions/briefs/delete/delete-brief-ui';

type BriefTableProps = {
  briefs: Brief.Relationships.Services.Response[];
  activeTab: string;
  accountRole: string;
  isLoading: boolean;
};

// SERVICES TABLE
export const BriefsTable = React.memo(function BriefsTable({
  activeTab,
  briefs,
  accountRole,
  isLoading,
}: BriefTableProps) {
  const { t } = useTranslation('briefs');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [search, setSearch] = React.useState('');
  const router = useRouter();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const columns = useGetColumns(t);
  const filteredBriefs = useMemo(() => {
    const searchString = search?.toLowerCase();
    return briefs.filter((brief) => {
      const displayName = brief?.name.toLowerCase();
      return displayName.includes(searchString);
    });
  }, [briefs, search]);
  const options = useMemo(() => ({
    data: filteredBriefs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  }), [
    filteredBriefs, 
    columns, 
    sorting, 
    columnFilters, 
    columnVisibility, 
    rowSelection
  ]);

  const briefMutation = useMutation({
    mutationFn: async () => {
      const res = await createBrief({});
      await handleResponse(res, 'briefs', t);

      if (res.ok && res?.success?.data) {
        router.push(`briefs/${res?.success?.data?.id}`);
      }
    },
    onError: () => {
      console.error('Error creating the brief from the table');
    },
  });
  return (
    <div className="w-full">
      <div className="flex items-center justify-between pb-[24px]">
        <TabsList className="gap-2 bg-transparent">
          <ThemedTabTrigger
            value="services"
            activeTab={activeTab}
            option={'services'}
          >
            {t('services:serviceTitle')}
          </ThemedTabTrigger>
          <ThemedTabTrigger
            value="briefs"
            activeTab={activeTab}
            option={'briefs'}
          >
            {t('briefs:briefs', { ns: 'briefs' })}
          </ThemedTabTrigger>
        </TabsList>

        <div className="flex w-full justify-end gap-4">
          <div className="relative ml-auto flex w-fit flex-1 md:grow-0">
            <Search className="text-muted-foreground absolute right-2.5 top-2.5 h-4 w-4" />

            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={t('briefs:search')}
              className="bg-background w-full rounded-lg pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          {briefs.length > 0 && (
            <ThemedButton
              onClick={async () => await briefMutation.mutateAsync()}
              disabled={briefMutation.isPending}
              className="flex items-center gap-2"
            >
              {briefMutation.isPending ? (
                <>
                  <span>{t('createBrief')}</span>
                  <Spinner className="h-4 w-4" />
                </>
              ) : (
                <span>{t('createBrief')}</span>
              )}
            </ThemedButton>
          )}
        </div>
      </div>
      <Separator />

      {isLoading ? (
        <SkeletonTable columns={4} rows={7} className="mt-4" />
      ) : !briefs.length ? (
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          loading="lazy"
          title={t('briefs:empty.agency.title')}
          description={t('briefs:empty.agency.description')}
          button={
            accountRole === 'agency_owner' ||
            accountRole === 'agency_project_manager' ? (
              <ThemedButton
                onClick={async () => await briefMutation.mutateAsync()}
                disabled={briefMutation.isPending}
                className="flex items-center gap-2"
              >
                {briefMutation.isPending ? (
                  <>
                    <span>{t('createBrief')}</span>
                    <Spinner className="h-4 w-4" />
                  </>
                ) : (
                  <span>{t('createBrief')}</span>
                )}
              </ThemedButton>
            ) : undefined
          }
        />
      ) : (
        <DataTable
          data={filteredBriefs}
          columns={columns}
          options={options}
          className="mt-4 bg-white"
          virtualization={briefs.length > 50}
        />
      )}
    </div>
  );
});

// TFunction<'briefs', undefined>
const useGetColumns = (
  t: TFunction<'briefs', undefined>,
): ColumnDef<Brief.Relationships.Services.Response>[] => {
  const queryClient = useQueryClient();

  const duplicateBriefMutation = useMutation({
    mutationFn: async (briefId: string) => {
      const res = await duplicateBrief(briefId);
      await handleResponse(res, 'briefs', t);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['briefs'] });
    },
  });

  const getTagColors = useMemo(() => [
    {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-300',
    },
    {
      bgColor: 'bg-violet-100',
      textColor: 'text-violet-800',
      borderColor: 'border-violet-300',
    },
    {
      bgColor: 'bg-fuchsia-100',
      textColor: 'text-fuchsia-800',
      borderColor: 'border-fuchsia-300',
    },
    {
      bgColor: 'bg-cyan-100',
      textColor: 'text-cyan-800',
      borderColor: 'border-cyan-300',
    },
    {
      bgColor: 'bg-teal-100',
      textColor: 'text-teal-800',
      borderColor: 'border-teal-300',
    },
  ], []);

  return useMemo(
    () => [
      {
        accessorKey: 'name',
        header: t('name'),
        cell: ({ row }) => {
          return <div className="capitalize">{row.getValue('name')}</div>;
        },
      },
      {
        accessorKey: 'services',
        header: t('services'),
        cell: ({ row }) => {
          const services = row.original.services;
          const maxTags = 4;
          
          return (
            <div className="flex gap-2">
              {services?.slice(0, maxTags).map((service, index) => {
                const tagColor = getTagColors[index % getTagColors.length];
                
                return (
                  <div
                    key={service.id || index}
                    className={`boder-neutral-400 rounded-full border px-2 ${tagColor?.bgColor} ${tagColor?.textColor} ${tagColor?.borderColor} truncate font-semibold`}
                  >
                    {service.name}
                  </div>
                );
              })}
              {services?.length > maxTags && (
                <div className="flex items-center gap-1 truncate rounded-full border border-neutral-200 bg-gray-100 px-2 text-sm font-medium text-gray-500">
                  +{services.length - maxTags}
                </div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at_column',
        header: ({ column }) => {
          return (
            <div>
              <Button
                variant="ghost"
                onClick={() =>
                  column.toggleSorting(column.getIsSorted() === 'asc')
                }
              >
                <div className="flex items-center justify-between">
                  <span>{t('createdAt')}</span>
                  <ArrowUp className="ml-2 h-4 w-4" />
                </div>
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const date = new Date(row.original.created_at);
          const day = date.getDate().toString().padStart(2, '0');
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const year = date.getFullYear();

          const formattedDate = `${day}-${month}-${year}`;

          return (
            <span className="text-sm font-medium text-gray-900">
              {formattedDate}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: t('actions'),
        enableHiding: false,
        cell: ({ row }) => {
          const brief = row.original;
          return (
            <div className="h-18 flex items-center gap-4 self-stretch p-4">
              <Link href={`/briefs/${brief.id}`}>
                <Pen className="h-4 w-4 cursor-pointer text-gray-600" />
              </Link>
              <Tooltip content={t('duplicateBrief')}>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => duplicateBriefMutation.mutate(brief.id)}
                  disabled={duplicateBriefMutation.isPending}
                >
                  <Copy className="h-4 w-4 cursor-pointer text-gray-600" />
                </Button>
              </Tooltip>
              <DeleteBriefDialog briefId={brief.id} />
            </div>
          );
        },
      },
    ],
    [t, duplicateBriefMutation, getTagColors],
  );
};
