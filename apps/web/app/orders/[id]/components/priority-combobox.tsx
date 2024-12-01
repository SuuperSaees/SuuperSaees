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
import { updateOrder } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';

import {
  generateDropdownOptions,
  getPriorityClassName,
} from '../utils/generate-options-and-classnames';

interface PriorityComboboxProps {
  order?: Order.Type;
  mode: 'order' | 'subtask';
  subtask?: Subtask.Type;
  [key: string]: unknown;
}

export function PriorityCombobox({
  order,
  mode,
  subtask,
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
        await updateOrder(order.id, { priority });
        return router.push(`/orders/${order?.id}`);
      } else {
        throw new Error('Order ID is undefined');
      }
    },
    onSuccess: () => {
      toast.success('Success', {
        description: t('success.orders.orderPriorityUpdated'),
      });
    },
    onError: () => {
      toast.error('Error', {
        description: t('error.orders.failedToUpdateOrderPriority'),
      });
    },
  });

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
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[130px] p-0">
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
