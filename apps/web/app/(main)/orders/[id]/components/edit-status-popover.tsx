'use client';

import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Spinner } from '@kit/ui/spinner';

import { updateOrder, logOrderActivities } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { updateStatusById } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { convertToCamelCase, convertToSnakeCase, convertToTitleCase } from '../utils/format-agency-names';
import { useTranslation } from 'react-i18next';
import { updateCache } from '~/utils/handle-caching';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { useAgencyStatuses } from '../../components/context/agency-statuses-context';
import { Dispatch, SetStateAction } from 'react';
import { Order } from '~/lib/order.types';
interface EditStatusPopoverProps {
  status_id: number;
  status_name: string;
  currentStatusId: number;
  status_color: string;
  order_id?: number;
  task_id?: string;
  mode?: 'order' | 'subtask';
  agency_id: string;
  preventEditName?: boolean;
  setPopoverValue: (value: string) => void;
  open: boolean;
  setOpen: (value: boolean) => void;
  isHovered?: boolean;
  setIsHovered?: (value: boolean) => void;
  setCurrentStatusData: Dispatch<SetStateAction<AgencyStatus.Type | undefined>>;
}

function EditStatusPopover({
  status_id,
  status_name,
  currentStatusId,
  status_color,
  order_id,
  task_id,
  mode,
  agency_id,
  open,
  setOpen,
  setIsHovered,
  preventEditName = false,
  setPopoverValue,
  setCurrentStatusData
}: EditStatusPopoverProps) {
  const [name, setName] = useState<string>(status_name ?? '');
  const [color, setColor] = useState<string>(status_color ?? '');
  const { updateStatuses } = useAgencyStatuses();
 
  const router = useRouter();
  const queryClient = useQueryClient()
  const {t} = useTranslation('orders')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleCircleClick = () => {
    inputRef.current?.click()
  }

  const defaultStatuses = new Set(['pending', 'completed', 'in_review', 'annulled', 'anulled', 'in_progress']);
  const isDefaultState = defaultStatuses.has(name);

  const updateStatusMutation = useMutation({
    mutationFn: async() =>
      await updateStatusById(status_id, { status_name: convertToSnakeCase(name), status_color: color }),
    onSuccess: (updatedStatus) => {
      // const cachedStatuses = getCache<AgencyStatus.Type[]>(`${CACHE_KEY}_${agency_id}`);
      // if (cachedStatuses) {
      //   const updatedStatuses = cachedStatuses.map(status =>
      //     status.id === status_id ? { ...status, ...updatedStatus } : status
      //   );
      updateStatuses(updatedStatus as AgencyStatus.Type);
      if(status_id === currentStatusId) {
        setCurrentStatusData(updatedStatus as AgencyStatus.Type);
      }
      
        updateCache(
          updatedStatus,
          queryClient,
          ['agencyStatuses', agency_id],
        );


      toast.success('Status updated successfully');
      if(name !== status_name && status_id === currentStatusId) {
        setPopoverValue(convertToSnakeCase(name));
      }

      setOpen(false);
      // setRefresh();
      router.refresh();
    },
    onError: () => {
      toast.error('Failed to update status');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      const {order, user} = await updateOrder(order_id as number, { status: convertToSnakeCase(name) });
      return {order, user}
    },
    onSuccess: async ({order, user}) => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      const fields: (keyof Order.Update)[] = ['status'];
      await logOrderActivities(order_id as number, order, user?.id ?? '', user?.user_metadata?.name ?? user?.user_metadata?.email ?? '', undefined, fields);
      router.refresh()
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })

  const changeSubtaskStatus = useMutation({
    mutationFn: async () => {
      await updateSubtaskById(task_id as string, { state: convertToSnakeCase(name) });
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

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateStatusMutation.mutate()
    if (name !== status_name) {
      if(mode === 'order'){
        updateOrderMutation.mutate()
      }else{
        changeSubtaskStatus.mutate()
      }
    }
  }

  const handlePopoverClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Popover open={open} >
      <PopoverTrigger asChild>
        <Pencil
          className="h-5 w-5 cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(!open);
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-80" onClick={handlePopoverClick}>
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-4">
          <div className="flex items-center gap-2">
            
            <Input
              id="name"
              value={isDefaultState ? t(`details.statuses.${convertToCamelCase(name ?? '')}`) : convertToTitleCase(name) ?? ''}
              defaultValue={isDefaultState ? t(`details.statuses.${convertToCamelCase(name ?? '')}`) : convertToTitleCase(name) ?? ''}
              onChange={(e) => setName(e.target.value)}
              disabled={preventEditName}
              className="h-8 w-[80%]"
              onClick={(e) => e.stopPropagation()}
            />
            
            <div
              className="h-10 w-10 cursor-pointer rounded-full border-4 border-white shadow-lg transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              onClick={handleCircleClick}
            ></div>
            <input
              ref={inputRef}
              type="color"
              value={color}
              onChange={handleColorChange}
              className="sr-only"
              aria-label="Choose color"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="secondary" onClick={() => {
              setOpen(false)
              setIsHovered?.(false)
              }}>
              {t('cancel')}
            </Button>
            <ThemedButton
              onClick={(e: React.MouseEvent) => {
                handleSave(e)
                setIsHovered?.(false)
              }}
              className="flex items-center gap-1"
            >
              <p>{t('saveChanges')}</p>
              {(updateStatusMutation.status === 'pending') && (
                <Spinner className="h-4 w-4" />
              )}
            </ThemedButton>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default EditStatusPopover;
