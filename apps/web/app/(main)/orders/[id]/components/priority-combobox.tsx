'use client';

import * as React from 'react';
import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@kit/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { cn } from '@kit/ui/utils';

import { Order } from '~/lib/order.types';
import { Subtask } from '~/lib/tasks.types';
import { updateOrder, logOrderActivities } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';

import {
  generateDropdownOptions,
  getPriorityClassName,
} from '../utils/generate-options-and-classnames';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface PriorityComboboxProps {
  order?: Order.Response;
  mode: 'order' | 'subtask';
  subtask?: Subtask.Type;
  blocked?: boolean;
  [key: string]: unknown;
}

export function PriorityCombobox({
  order,
  mode,
  subtask,
  blocked,
  ...rest
}: PriorityComboboxProps) {
  const { t } = useTranslation('orders');
  const [open, setOpen] = useState(false);
  const [priorityValue, setPriorityValue] = useState(
    mode == 'order' ? order?.priority : subtask?.priority,
  );

  const priorities = ['low', 'medium', 'high'];
  const priorityOptions = generateDropdownOptions(priorities, t, 'priorities');
  const router = useRouter();
  const { workspace: userWorkspace } = useUserWorkspace();
  const changeSubtaskPriority = useMutation({
    mutationFn: async (priority: Order.Type['priority']) => {
      if (subtask?.id) {
        await updateSubtaskById(subtask?.id, { priority });
      } else {
        throw new Error('Task ID is undefined');
      }
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
  const changeOrderPriority = useMutation({
    mutationFn: async (priority: Order.Type['priority']) => {
      if (order?.id) {
        const {order: updatedOrder} = await updateOrder(order.id, { priority }, userWorkspace.name ?? undefined);
        router.push(`/orders/${order?.id}`);
        return { updatedOrder };
      } else {
        throw new Error('Order ID is undefined');
      }
    },
    onSuccess: async ({ updatedOrder }: { updatedOrder: Order.Type | null }) => {
      toast.success('Success', {
        description: t('success.orders.orderPriorityUpdated'),
      });
      const fields: (keyof Order.Update)[] = ['priority'];
      await logOrderActivities(updatedOrder?.id ?? 0, updatedOrder ?? {}, userWorkspace?.id ?? '', userWorkspace?.name ?? '', undefined, fields);
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderPriority'),
      });
    },
  });

  React.useEffect(() => {
    if (mode === 'order') {
      setPriorityValue(order?.priority);
    } else {
      setPriorityValue(subtask?.priority);
    }
  }, [order, subtask, mode]);   

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="hover:bg-none">
        <Button
          variant="static"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'hover:bg-none',
            `inline-flex items-center rounded-lg border-none p-2 shadow-none hover:bg-none ${getPriorityClassName(priorityValue ?? '')}`,
          )}
          {...rest}
        >
          <div className="flex items-center gap-[0.05rem]">
            <div className="mr-2 h-2 w-2 rounded-full bg-current"></div>
            <p>
              {t(`details.priorities.${priorityValue}`)}
            </p>
          </div>
          {!blocked && <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0" hidden={blocked}>
        <Command>
          <CommandList>
            <CommandGroup>
              {priorityOptions.map((priority) => (
                <CommandItem
                  key={priority.value}
                  value={priority.value}
                  onSelect={(currentValue) => {
                    if (currentValue === priorityValue) {
                      return;
                    }
                    if (mode === 'subtask') {
                      changeSubtaskPriority.mutate(
                        currentValue as Order.Type['priority'],
                      );
                    } else {
                      changeOrderPriority.mutate(
                        currentValue as Order.Type['priority'],
                      );
                    }
                    setPriorityValue(currentValue as Order.Type['priority']);
                    setOpen(false);
                  }}
                >
                  <div className={`flex gap-[0.05rem] items-center cursor-pointer rounded-lg p-1 font-medium px-3 ${getPriorityClassName(priority.value)}`}>
                    <div className="mr-2 h-2 w-2 rounded-full bg-current"></div>
                    <p
                      className={``}
                    >
                      {t(`details.priorities.${priority.value}`)}
                    </p>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
