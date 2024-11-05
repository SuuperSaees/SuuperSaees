import { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useMutation, useQuery } from '@tanstack/react-query';
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
import EditStatusPopover from './edit-status-popover';
import { SortableStatus } from './sortable-status';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { ChevronDown } from 'lucide-react';
import { Trash2 } from 'lucide-react';

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
  const { t } = useTranslation('orders');
  const router = useRouter();

  const { data: agencyStatuses, refetch } = useQuery({
    queryKey: ['agencyStatuses', agency_id],
    queryFn: () => getAgencyStatuses(agency_id),
    initialData: [],
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { sensors, handleDragEnd, statuses } = useStatusDragAndDrop(
    agencyStatuses ?? [],
  );

  useEffect(() => {
    refetch().catch((error) => {
      console.error(error);
    });
  }, [refetch]);

  const findStatusColor = useCallback(
    (statusName: string) => {
      const status = agencyStatuses?.find((s) => s.status_name === statusName);
      return status?.status_color;
    },
    [agencyStatuses],
  );

  const createStatus = useMutation({
    mutationFn: createNewStatus,
    onSuccess: () => {
      refetch().catch((error) => {
        console.error(error);
      });
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
        description: 'Order status updated successfully!',
      });
    },
    onError: (error) => {
      console.log(error);
      toast.error('Error', {
        description: 'Order status could not be updated.',
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
    onSuccess: () => {
      refetch().catch((error) => {
        console.error(error);
      });
      toast.success('Success', { description: 'Status deleted successfully!' });
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to delete status.' });
    },
  });

  const handleCreateStatus = () => {
    createStatus.mutate({
      status_name: customStatus,
      status_color: '#8fd6fc',
      agency_id: agency_id,
    });
    setCustomStatus('');
  };

  const handleDeleteStatus = (statusId: number) => {
    if (mode === 'order') {
      changeOrderStatus.mutate({
        orderId: order?.id,
        status: 'pending',
      });
    } else if (mode === 'subtask') {
      changeSubtaskStatus.mutate({
        subtaskId: subtask?.id,
        status: 'pending',
      });
    }
    deleteStatus.mutate(statusId);
  };

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
          variant="normal"
          role="combobox"
          aria-expanded={open}
          className={` shadow-none inline-flex items-center rounded-lg p-2 border-none ${popoverValue == 'in_progress' ? 'bg-[#F4EBFF] text-[#6941C6]' : statuses.includes(popoverValue) ? statusColors[popoverValue as keyof typeof statusColors] : ''}`}

          style={{
            backgroundColor: findStatusColor(popoverValue),
            color: darkenColor(
              findStatusColor(popoverValue) ?? '#000000',
              0.55,
            ),
          }}
        >
          <span className="pl-2 pr-2">{popoverValue}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-64 w-[250px] p-0">
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
                        <CommandItem
                          value={status?.status_name ?? undefined}
                          onSelect={(currentValue: string) => {
                            if (status?.status_name !== popoverValue) {
                              if (mode === 'order') {
                                changeOrderStatus.mutate({
                                  orderId: order?.id,
                                  status: status?.status_name ?? '',
                                });
                              } else if (mode === 'subtask') {
                                changeSubtaskStatus.mutate({
                                  subtaskId: subtask?.id,
                                  status: status?.status_name ?? '',
                                });
                              }
                              setPopoverValue(
                                currentValue === popoverValue
                                  ? ''
                                  : currentValue,
                              );
                              setOpen(false);
                            }
                          }}
                          className="flex w-full items-center justify-between p-0"
                        >
                          <p
                            className="m-2 cursor-pointer rounded-lg p-1 font-medium"
                            style={{
                              color: status?.status_color
                                ? darkenColor(status.status_color, 0.55)
                                : undefined,
                              backgroundColor: status?.status_color,
                            }}
                          >
                            {status?.status_name}
                          </p>
                          <div className="flex gap-2 px-1 text-gray-500">
                            <EditStatusPopover
                              status_id={status.id}
                              status_color={status.status_color ?? ''}
                              status_name={status.status_name ?? ''}
                              order_id={order?.id}
                              task_id={subtask?.id}
                              setValue={setPopoverValue}
                              mode={mode}
                              preventEditName = {status.status_name === 'Pending response' || status.status_name === 'Completed' || status.status_name === 'In review' || status.status_name === 'Cancelled' || status.status_name === 'In progress'}
                            />
                            {
                              status.status_name === 'Pending response' ||
                              status.status_name === 'Completed' ||
                              status.status_name === 'In review' ||
                              status.status_name === 'Cancelled' ||
                              status.status_name === 'In progress' ? null : (
                                <Trash2
                                  className="h-5 w-5 cursor-pointer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteStatus(status.id);
                                    setOpen(false);
                                  }}
                                />
                              )
                            }
                          </div>
                        </CommandItem>
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
