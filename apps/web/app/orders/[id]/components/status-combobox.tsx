import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MutationFunction, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { darkenColor } from '~/utils/generate-colors';
import { useStatusDragAndDrop } from '../hooks/agency-statuses/use-status-drag-and-drop';
import StatusComboboxItem from './status-combobox-item';
import { SortableStatus } from './sortable-status';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import { convertToTitleCase, convertToSnakeCase, convertToCamelCase } from '../utils/format-agency-names';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { updateCache } from '~/utils/handle-caching';

interface StatusComboboxProps {
  order?: Order.Type;
  statusData?: AgencyStatus.Type;
  agencyStatuses?: AgencyStatus.Type[];
  subtask?: Subtask.Type;
  agency_id: string;
  mode: 'order' | 'subtask';
}

// export const baseColors = {
//   "pending":{
//     "bg":"#fef7c3",
//     "text":"#a15c07"
//   },
//   "in_progress":{
//     "bg":"#F4EBFF",
//     "text":"#6941C6"
//   },
//   "completed":{
//     "bg":"#DCFAE6",
//     "text":"#067647",
//   },
//   "in_review":{
//     "bg":"#FFEBD9",
//     "text":"#C66A41",
//   },
//   "annulled":{
//     "bg":"#FEE4E2",
//     "text":"#B42318",
//   },
//   "anulled":{
//     "bg":"#FEE4E2",
//     "text":"#B42318",
//   },
// }

function StatusCombobox({
  statusData,
  order,
  agencyStatuses,
  subtask,
  mode,
  agency_id,
}: StatusComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [currentStatusData, setCurrentStatusData] = useState<AgencyStatus.Type | undefined>(statusData);
  const [popoverValue, setPopoverValue] = useState<string>(
    mode == 'order' ? (statusData?.status_name ?? '') : (subtask?.state ?? ''),
  );
  const [customStatus, setCustomStatus] = useState<string>('');
  const { t } = useTranslation(['orders', 'responses']);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { sensors, handleDragEnd, statuses } = useStatusDragAndDrop(
    agencyStatuses ?? [],
    agency_id,
  );

  const createStatus = useMutation({
    mutationFn: createNewStatus as MutationFunction<AgencyStatus.Type>,
    onSuccess: (newStatus: AgencyStatus.Type) => {
      const updatedStatuses = [...(agencyStatuses ?? []), newStatus];
      agencyStatuses = [...updatedStatuses];
      updateCache(
        updatedStatuses,
        queryClient,
        ['agencyStatuses', agency_id],
      );
      toast.success('Success', {
        description: 'New status created successfully!',
      });
      router.refresh();
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to create new status.' });
    },
  });

  const changeOrderStatus = useMutation({
    mutationFn: async ({
      orderId,
      status,
      status_id,
      status_color,
    }: {
      orderId: Order.Type['id'];
      status: string;
      status_id: number;
      status_color: string | null;
    }) => {
      setCurrentStatusData(statusData ? {
        ...statusData,
        status_name: status ?? null,
        status_color: status_color ?? null,
      } : undefined);
      await updateOrder(orderId, { status, status_id });
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
        updatedStatuses,
        queryClient,
        ['agencyStatuses', agency_id]
      );
      toast.success('Success', { description: 'Status deleted successfully!' });
      router.refresh();
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
  const defaultStatuses = new Set(['pending', 'completed', 'in_review', 'annulled', 'anulled', 'in_progress']);
  const isDefaultState = defaultStatuses.has(popoverValue ?? '');

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
            backgroundColor: currentStatusData?.status_color ?? '',
            color: darkenColor(
              currentStatusData?.status_color ?? '#000000',
              0.60
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
                                  status_id: status.id,
                                  status_color: status.status_color ?? null,
                                })
                              } else if (mode === 'subtask') {
                                changeSubtaskStatus.mutate({
                                  subtaskId: subtask?.id ?? '',
                                  status: convertToSnakeCase(status?.status_name ?? ''),
                                  // status_id: status.id,
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
