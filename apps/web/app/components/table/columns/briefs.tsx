// apps/web/app/components/table/columns/briefs.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import { Copy, Pen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';

import Tooltip from '~/components/ui/tooltip';
import { Brief } from '~/lib/brief.types';
import { handleResponse } from '~/lib/response/handle-response';
import { duplicateBrief } from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import DeleteBriefDialog from '~/team-accounts/src/server/actions/briefs/delete/delete-brief-ui';

import { TFunction } from '../../../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { ColumnConfigs } from '../types';
import PrefetcherLink from '../../../components/shared/prefetcher-link';


export const briefsColumns = (
  t: TFunction,
  hasPermission?: ColumnConfigs['briefs']['hasPermission'],
): ColumnDef<Brief.Relationships.Services.Response>[] => {
  return [
    {
      accessorKey: 'name',
      header: t('briefs:name'),
      cell: ({ row }) => (
        <PrefetcherLink href={`/briefs/${row.original.id}`} className="flex w-full gap-2">
          <span className="line-clamp-3 font-semibold">
            {row.getValue('name')}
          </span>
        </PrefetcherLink>
      ),
    },
    {
      accessorKey: 'services',
      header: t('briefs:services'),
      cell: ({ row }) => {
        const services = row.original.services;
        return <BriefServices services={services} />;
      },
    },
    {
      accessorKey: 'created_at',
      header: () => (
        <span className="flex items-center gap-2">{t('briefs:createdAt')}</span>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: t('briefs:actions'),
      cell: ({ row }) => {
        const isDisabled = hasPermission && !hasPermission();
        return (
          <BriefActions brief={row.original} disabled={isDisabled ?? false} />
        );
      },
    },
  ];
};

// Separate component for Services cell
const BriefServices = ({
  services,
}: {
  services: Brief.Relationships.Services.Response['services'];
  
}) => {
  const tagColors = [
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
  ];

  const maxTags = 4;

  if (!Array.isArray(services) || services.length === 0) {
    return <span className="text-gray-500">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {services.slice(0, maxTags).map((service, index) => {
        const tagColor = tagColors[index % tagColors.length]!;

        return (
          <div
            key={service.id}
            className={`truncate rounded-full border px-2 py-1 text-sm font-semibold ${tagColor.bgColor} ${tagColor.textColor} ${tagColor.borderColor}`}
          >
            {service.name}
          </div>
        );
      })}
      {services.length > maxTags && (
        <div className="flex items-center rounded-full border border-neutral-200 bg-gray-100 px-2 py-1 text-sm font-medium text-gray-500">
          +{services.length - maxTags}
        </div>
      )}
    </div>
  );
};

function BriefActions({
  brief,
  disabled,
}: {
  brief: Brief.Relationships.Services.Response;
  disabled: boolean;
}) {
  const { t } = useTranslation('briefs');
  const queryClient = useQueryClient();

  const duplicateBriefMutation = useMutation({
    mutationFn: async (briefId: string) => {
      const res = await duplicateBrief(briefId);
      await handleResponse(res, 'briefs', t);
    },
    onSuccess: async () => {
      // Mark all briefs queries as invalidated
      await queryClient.invalidateQueries({
        queryKey: ['briefs'],
        exact: false,
      });
    },
  });

  return (
    <div className="flex items-center gap-4">
      <Tooltip content={t('briefs:editBrief')}>
        <PrefetcherLink
          href={`/briefs/${brief.id}`}
          className="rounded-md p-2 hover:bg-accent"
        >
          <Pen className="h-4 w-4 text-gray-600 hover:text-gray-900" />
        </PrefetcherLink>
      </Tooltip>

      <Tooltip content={t('briefs:duplicateBrief')}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => duplicateBriefMutation.mutate(brief.id)}
          disabled={disabled || duplicateBriefMutation.isPending}
        >
          <Copy className="h-4 w-4 text-gray-600 hover:text-gray-900" />
        </Button>
      </Tooltip>

      <DeleteBriefDialog briefId={brief.id} />
    </div>
  );
}
