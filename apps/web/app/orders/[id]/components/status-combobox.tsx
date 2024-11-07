import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@kit/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Order } from '~/lib/order.types';
import { Subtask } from '~/lib/tasks.types';
import { updateOrder } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { createNewStatus } from '~/team-accounts/src/server/actions/statuses/create/create-status';
import { deleteStatusById } from '~/team-accounts/src/server/actions/statuses/delete/delete-status';
import { getAgencyStatuses } from '~/team-accounts/src/server/actions/statuses/get/get-agency-statuses';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { darkenColor } from '~/utils/generate-colors';
import { useStatusDragAndDrop } from '../hooks/agency-statuses/use-status-drag-and-drop';
import StatusComboboxItem from './status-combobox-item';
import { SortableStatus } from './sortable-status';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import { convertToTitleCase, convertToSnakeCase, convertToCamelCase } from '../utils/format-agency-names';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { getCache, setCache, updateCache } from '~/utils/handle-caching';
import { CACHE_KEY, CACHE_EXPIRY } from '../hooks/agency-statuses/use-status-drag-and-drop';

interface StatusComboboxProps {
  order?: Order.Type;
  subtask?: Subtask.Type;
  agency_id: string;
  mode: 'order' | 'subtask';
}

function StatusCombobox({
  order,
  subtask,
  mode,
  agency_id,
}: StatusComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [popoverValue, setPopoverValue] = useState<string>(
    mode == 'order' ? (order?.status ?? '') : (subtask?.state ?? ''),
  );
  const [customStatus, setCustomStatus] = useState<string>('');
  const { t } = useTranslation(['orders', 'responses']);
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { data: agencyStatuses, refetch } = useQuery({
    queryKey: ['agencyStatuses', agency_id],
    queryFn: async () => {
      const cachedData = getCache<AgencyStatus.Type[]>(`${CACHE_KEY}_${agency_id}`);
      if (cachedData) {
        return cachedData;
      }
      const fetchedData = await getAgencyStatuses(agency_id);
      setCache(`${CACHE_KEY}_${agency_id}`, fetchedData, CACHE_EXPIRY);
      return fetchedData;
    },
    initialData: [],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: CACHE_EXPIRY,
  });

  const { sensors, handleDragEnd, statuses } = useStatusDragAndDrop(
    agencyStatuses ?? [],
    agency_id,
  );

  useEffect(() => {
    refetch().catch((error) => {
      console.error(error);
    });
  }, [refetch]);

  const findStatusColor = useCallback(
    (statusName: string) => {
      const status = agencyStatuses?.find((s) => s.status_name === statusName);
      return status?.status_color ?? '#E8EFFC';
    },
    [agencyStatuses],
  );

  const createStatus = useMutation({
    mutationFn: createNewStatus,
    onSuccess: (newStatus) => {
      const updatedStatuses = [...(agencyStatuses ?? []), newStatus];
      updateCache(
        `${CACHE_KEY}_${agency_id}`,
        updatedStatuses,
        queryClient,
        ['agencyStatuses', agency_id],
        CACHE_EXPIRY
      );
      toast.success('Success', {
        description: 'New status created successfully!',
      });
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to create new status.' });
    },
  });

  const changeOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: Order.Type['id'];
      status: string;
    }) => {
      await updateOrder(orderId, { status });
      router.refresh();
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderStatusUpdated'),
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderStatus'),
      });
    },
  });

  const changeSubtaskStatus = useMutation({
    mutationFn: async ({
      subtaskId,
      status,
    }: {
      subtaskId: Subtask.Type['id'];
      status: string;
    }) => {
      await updateSubtaskById(subtaskId, {
        state: status,
        completed: status === 'completed',
      });
      router.refresh();
    },
    onSuccess: () => {
      toast.success('Success', {
        description: 'Subtask status updated successfully!',
      });
    },
    onError: () => {
      toast.error('Error', {
        description: 'Subtask status could not be updated.',
      });
    },
  });

  const deleteStatus = useMutation({
    mutationFn: deleteStatusById,
    onSuccess: (_, deletedStatusId) => {
      const updatedStatuses = agencyStatuses?.filter(status => status.id !== deletedStatusId) ?? [];
      updateCache(
        `${CACHE_KEY}_${agency_id}`,
        updatedStatuses,
        queryClient,
        ['agencyStatuses', agency_id],
        CACHE_EXPIRY
      );
      toast.success('Success', { description: 'Status deleted successfully!' });
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to delete status.' });
    },
  });

  const handleCreateStatus = () => {
    createStatus.mutate({
      status_name: convertToSnakeCase(customStatus),
      status_color: '#8fd6fc',
      agency_id: agency_id,
    });
    setCustomStatus('');
  };

  const handleDeleteStatus = (statusId: number) => {
    deleteStatus.mutate(statusId);
  };

  const isDefaultState = ['pending', 'completed', 'in_review', 'annulled', 'anulled', 'in_progress'].includes(popoverValue ?? '')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        disabled={
          createStatus.status == 'pending' ||
          deleteStatus.status == 'pending' ||
          changeSubtaskStatus.status == 'pending'
        }
      >
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={` shadow-none inline-flex items-center rounded-lg p-2 border-none`}

          style={{
            backgroundColor: findStatusColor(popoverValue) ?? '',
            color: darkenColor(
              findStatusColor(popoverValue) ?? '#000000',
              0.55,
            ),
          }}
        >
          <span className="pl-2 pr-2">{isDefaultState ? t(`details.statuses.${convertToCamelCase(popoverValue ?? '')}`, {ns:'orders'}) : convertToTitleCase(popoverValue)}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-64 w-[290px] p-0">
        <Command>
          <CommandInput
            placeholder=""
            value={customStatus}
            onValueChange={setCustomStatus}
          />
          <CommandList>
            <CommandGroup>
              {customStatus && (
                <CommandItem
                  value={customStatus}
                  onSelect={() => {
                    setOpen(false);
                    handleCreateStatus();
                  }}
                  className="flex gap-3"
                >
                  <p className="text-sm font-bold text-muted-foreground">
                    {t('create')}
                  </p>
                  <p className="rounded-sm bg-blue-300 px-1 text-blue-800">
                    {customStatus}
                  </p>
                </CommandItem>
              )}
              {!customStatus && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={statuses?.map((s) => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {statuses?.map((status) => (
                      <SortableStatus key={status.id} status={status}>
                        <StatusComboboxItem
                          status={status}
                          onSelect={(currentValue) => {
                            if (status.status_name !== popoverValue) {
                              if (mode === 'order') {
                                changeOrderStatus.mutate({
                                  orderId: order?.id ?? -1,
                                  status: convertToSnakeCase(status?.status_name ?? ''),
                                })
                              } else if (mode === 'subtask') {
                                changeSubtaskStatus.mutate({
                                  subtaskId: subtask?.id ?? '',
                                  status: convertToSnakeCase(status?.status_name ?? ''),
                                })
                              }
                              setPopoverValue(currentValue === popoverValue ? '' : currentValue)
                              setOpen(false)
                            }
                          }}
                          onDelete={handleDeleteStatus}
                          order={order}
                          subtask={subtask}
                          agency_id={agency_id}
                          mode={mode}
                          setPopoverValue={setPopoverValue}
                        />
                      </SortableStatus>
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default StatusCombobox;
