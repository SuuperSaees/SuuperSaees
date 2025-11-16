'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ban, MoreVertical } from 'lucide-react';
import { deleteClientService } from 'node_modules/@kit/team-accounts/src/server/actions/services/delete/delete-service-server';

import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

import { Service } from '~/lib/services.types';

import Dropdown from '../ui/dropdown';
import { handleResponse } from '~/lib/response/handle-response';
import { useTranslation } from 'react-i18next';

type ServiceCardProps = {
  service: Service.Relationships.Client.Response;
  clientOrganizationId: string;
  currentUserRole: string;
};
export default function ServiceCard({
  service,
  clientOrganizationId,
  currentUserRole,
}: ServiceCardProps) {
  const queryClient = useQueryClient();
  const { t } = useTranslation('services');

  const cancelClientService = useMutation({
    mutationFn: async () => {

      const res = await deleteClientService(
        clientOrganizationId,
        service.id,
        service.subscription_id,
      );
      await handleResponse(res, 'services', t);
      await queryClient.invalidateQueries({
        queryKey: ['services', clientOrganizationId],
      });
    }, 
    onError: () => console.error('Error cancelling service'),
  });

  const serviceOptions = [
    {
      value: (
        <span className="inline-flex w-full items-center gap-2 text-gray-600">
          <Ban className="h-5 w-5" />
          <Trans i18nKey={'service:cancel'} />
        </span>
      ),
      actionFn: async () => void (await cancelClientService.mutateAsync().catch(() => null)),
    },
  ];

  return (
    <div className="relative flex h-fit max-h-96 w-full max-w-xs flex-col gap-2">
      <div className="w-xs h-60 w-full overflow-hidden rounded-xl">
        {/* eslint-disable @next/next/no-img-element */}
        <img
          src={service.service_image ?? '/images/fallbacks/service-1.png'}
          alt={service.name ?? 'service'}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="line-clamp-4">
        <h3 className="text-lg font-semibold">{service.name}</h3>
        <p className="mt-2 text-sm text-gray-600">
          {service.service_description}
        </p>
      </div>
      {(currentUserRole === 'agency_owner' ||
        currentUserRole === 'agency_project_manager') && (
        <Dropdown options={serviceOptions}>
          <Button
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/70 p-0"
            variant={'ghost'}
            disabled={cancelClientService.isPending}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </Dropdown>
      )}
    </div>
  );
}