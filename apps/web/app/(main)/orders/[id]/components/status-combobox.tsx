import { useEffect, useState } from 'react';
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
import { Subtask } from '~/lib/tasks.types';
import { updateOrder, logOrderActivities } from '~/team-accounts/src/server/actions/orders/update/update-order';
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
import { useAgencyStatuses } from '../../components/context/agency-statuses-context'
import { Dispatch, SetStateAction } from 'react';
import { Order } from '~/lib/order.types';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

type ExtendedOrderType = Order.Type & {
  customer_name: string | null;
  customer_organization: string | null;
};
interface StatusComboboxProps {
  order?: Order.Response;
  agencyStatuses?: AgencyStatus.Type[];
  subtask?: Subtask.Type;
  agency_id: string;
  mode: 'order' | 'subtask';
  statusName?: string;
  setOrdersData?: Dispatch<SetStateAction<ExtendedOrderType[]>>;
  changeTabFilteredOrders?: (tab: 'open' | 'completed' | 'all') => void;
  activeTab?: 'open' | 'completed' | 'all';
  blocked?: boolean;
  [key: string]: unknown;
}

const defaultStatusColor = '#8fd6fc'

function StatusCombobox({
  order,
  subtask,
  mode,
  agency_id,
  setOrdersData,
  changeTabFilteredOrders,
  activeTab,
  blocked,
  ...rest
}: StatusComboboxProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { statuses, setStatuses } = useAgencyStatuses();
  const { sensors, handleDragEnd, statuses: statusesOrderByPosition } = useStatusDragAndDrop(
    statuses ?? [],
    agency_id,
  );
  const [currentStatusData, setCurrentStatusData] = useState<AgencyStatus.Type | undefined>(
    mode === 'order' ? statuses?.find(status => status.id === order?.status_id) : statuses?.find(status => status.id === subtask?.state_id)
  );

  // const currentStatusDataUseOnlyInSpecialCases = statuses?.find(status => status.id === order?.status_id);
  
  const [popoverValue, setPopoverValue] = useState<string>(
    mode == 'order' ?  currentStatusData?.status_name ?? '' : (subtask?.state ?? ''),
  );
  const [customStatus, setCustomStatus] = useState<string>('');
  const { t } = useTranslation(['orders', 'responses']);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { workspace: userWorkspace } = useUserWorkspace();
  const createStatus = useMutation({
    mutationFn: createNewStatus as MutationFunction<AgencyStatus.Type>,
    onSuccess: (newStatus: AgencyStatus.Type) => {
      const updatedStatuses = [...(statuses ?? []), newStatus];
      setStatuses(updatedStatuses);
      
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
      // status_color,
    }: {
      orderId: Order.Type['id'];
      status: string;
      status_id: number;
      // status_color: string | null;
    }) => {
      // setCurrentStatusData(statuses?.find(status => status.id === status_id))
      // setOrdersData(prevOrders => prevOrders.map(order => order.id === orderId ? { ...order, status: status, status_id: status_id } : order));
      setCurrentStatusData(statuses?.find(status => status.id === status_id));
      const { order: updatedOrder} = await updateOrder(orderId, { status, status_id }, userWorkspace.id ?? '');
      if(setOrdersData) {
        setOrdersData(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
            ? { ...order, status, status_id } 
            : order
        )
      );
    }
    if(changeTabFilteredOrders && activeTab) {
      changeTabFilteredOrders(activeTab);
    } 
      return { status, status_id, orderId, updatedOrder };
    },
    onMutate: ({ status_id, orderId, status }) => {
      const newStatusData = statuses?.find(status => status.id === status_id);
      setCurrentStatusData(newStatusData);
      const previousStatusData = currentStatusData;
      const previousOrders = queryClient.getQueryData(['orders']);

      router.refresh();
      if(setOrdersData) {
        setOrdersData(prevOrders => 
          prevOrders.map(order => 
            order.id === orderId 
              ? { ...order, status, status_id } 
              : order
          )
        );
      }
      queryClient.setQueryData(['orders'], (old: ExtendedOrderType[]) => {
        return old?.map((order: ExtendedOrderType) => 
          order.id === orderId 
            ? { ...order, status_id, status: newStatusData?.status_name } 
            : order
        );
      });

      return { previousStatusData, previousOrders };
    },
    onSuccess: async ({orderId, updatedOrder}: {orderId: Order.Type['id'], updatedOrder: Order.Type}) => {
      setPopoverValue(currentStatusData?.status_name ?? '');
      queryClient.invalidateQueries({ queryKey: ['orders'] }).catch((error) => {
        console.error('Error invalidating orders query:', error);
      });
      router.refresh();
      toast.success('Success', {
        description: t('success.orders.orderStatusUpdated'),
      });
      const fields: (keyof Order.Update)[] = ['status'];
      await logOrderActivities(orderId, updatedOrder, userWorkspace.id ?? '', userWorkspace.name ?? '', undefined, fields);
    },
    onError: (error, variables, context) => {
      if (context) {
        setCurrentStatusData(context.previousStatusData);
        queryClient.setQueryData(['orders'], context.previousOrders);
      }

      console.error(error);
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderStatus'),
      });
    },
  });

  const changeSubtaskStatus = useMutation({
    mutationFn: async ({
      subtaskId,
      status,
      status_id,
    }: {
      subtaskId: Subtask.Type['id'];
      status: string;
      status_id: number;
    }) => {
      setCurrentStatusData(statuses?.find(status => status.id === status_id));
      // if(setOrdersData) {
      //   setOrdersData(prevOrders => 
      //     prevOrders.map(order => 
      //       order.id === orderId 
      //       ? { ...order, status, status_id } 
      //       : order
      //   )
      // );
      await updateSubtaskById(subtaskId, {
        state: status,
        state_id: status_id,
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
    onMutate: (deletedStatusId: number) => {
      const updatedStatuses = statuses?.map(status => status.id === deletedStatusId ? { ...status, deleted_on: new Date().toISOString() } : status) ?? [];
      setStatuses(updatedStatuses);
      updateCache(
        updatedStatuses,
        queryClient,
        ['agencyStatuses', agency_id]
      );
      router.refresh();
    },
    onSuccess: () => {
      // const updatedStatuses = statuses?.map(status => status.id === deletedStatusId ? { ...status, deleted_on: new Date().toISOString() } : status) ?? [];
      // setStatuses(updatedStatuses);
      // updateCache(
      //   updatedStatuses,
      //   queryClient,
      //   ['agencyStatuses', agency_id]
      // );
      toast.success('Success', { description: 'Status deleted successfully!' });
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to delete status.' });
    },
  });

  const handleCreateStatus = () => {
    createStatus.mutate({
      status_name: convertToSnakeCase(customStatus),
      status_color: defaultStatusColor,
      agency_id: agency_id,
    });
    
    setCustomStatus('');
  };

  const handleDeleteStatus = (statusId: number) => {
    deleteStatus.mutate(statusId);
  };
  
  const defaultStatuses = new Set(['pending', 'completed', 'in_review', 'annulled', 'anulled', 'in_progress']);

  useEffect(() => {
    if (mode === 'order') { 
      setCurrentStatusData(statuses.find(status => status.id === order?.status_id));
    } else {
      setCurrentStatusData(statuses.find(status => status.id === subtask?.state_id));
    }
  }, [mode, order?.status_id, subtask?.state_id, statuses])
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
            backgroundColor: statuses?.find(status => status.id === currentStatusData?.id)?.status_color ?? '',
            color: darkenColor(
              statuses?.find(status => status.id === currentStatusData?.id)?.status_color ?? '#000000',
              0.60
            ),
          }}
          {...rest}
        >
          <span className="pl-2 pr-2">{defaultStatuses.has(statuses?.find(status => status.id === currentStatusData?.id)?.status_name ?? '') ? t(`details.statuses.${convertToCamelCase(statuses?.find(status => status.id === currentStatusData?.id)?.status_name ?? '')}`, {ns:'orders'}) : convertToTitleCase(statuses?.find(status => status.id === currentStatusData?.id)?.status_name ?? '')}</span>
          {!blocked && <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="h-64 w-[290px] p-0" hidden={blocked}>
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
                    items={statuses?.map((s) => s.id) ?? []}
                    strategy={verticalListSortingStrategy}
                  >
                    {statusesOrderByPosition
                      ?.filter(status => !status.deleted_on)
                      .map((orderedStatus) => {
                        const status = statuses?.find(s => s.id === orderedStatus.id);
                        if (!status) return null;
                        
                        return (
                        <SortableStatus key={status.id} status={status}>
                          <StatusComboboxItem
                            status={status}
                            currentStatusId={currentStatusData?.id as number}
                            onSelect={(currentValue) => {
                              if (status.status_name !== popoverValue) {
                                if (mode === 'order') {
                                  changeOrderStatus.mutate({
                                    orderId: order?.id ?? -1,
                                    status: convertToSnakeCase(status?.status_name ?? ''),
                                    status_id: status.id,
                                  })
                                } else if (mode === 'subtask') {
                                  changeSubtaskStatus.mutate({
                                    subtaskId: subtask?.id ?? '',
                                    status: convertToSnakeCase(status?.status_name ?? ''),
                                    status_id: status.id,
                                  })
                                }
                                setPopoverValue(currentValue === currentStatusData?.status_name ? '' : currentValue)
                                setOpen(false)
                              }
                            }}
                            onDelete={handleDeleteStatus}
                            order={order}
                            subtask={subtask}
                            agency_id={agency_id}
                            mode={mode}
                            setPopoverValue={setPopoverValue}
                            setCurrentStatusData={setCurrentStatusData}
                          />
                        </SortableStatus>
                       );
                      })}
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
