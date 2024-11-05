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

import { updateOrder } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { updateStatusById } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';

interface EditStatusPopoverProps {
  status_id: number;
  status_name: string;
  status_color: string;
  order_id?: number;
  task_id?: string;
  mode?: 'order' | 'subtask';
  preventEditName?: boolean;
  setValue: (value: string) => void;
}

function EditStatusPopover({
  status_id,
  status_name,
  status_color,
  order_id,
  task_id,
  mode,
  preventEditName = false,
  setValue,
}: EditStatusPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(status_name);
  const [color, setColor] = useState<string>(status_color);
  const router = useRouter();
  const queryClient = useQueryClient()

  const inputRef = useRef<HTMLInputElement>(null)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleCircleClick = () => {
    inputRef.current?.click()
  }

  const updateStatusMutation = useMutation({
    mutationFn: () =>
      updateStatusById(status_id, { status_name: name, status_color: color }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['agencyStatuses'] })
      toast.success('Status updated successfully')
      setValue(name)
      setOpen(false)
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const updateOrderMutation = useMutation({
    mutationFn: () => updateOrder(order_id, { status: name }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      router.refresh()
    },
    onError: () => {
      toast.error('Failed to update order')
    },
  })

  const changeSubtaskStatus = useMutation({
    mutationFn: async () => {
      await updateSubtaskById(task_id, { state: name });
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
    <Popover open={open} onOpenChange={setOpen}>
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
            {
              !preventEditName &&
              <Input
                id="name"
                value={name}
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 w-[80%]"
                onClick={(e) => e.stopPropagation()}
              />
            }
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
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <ThemedButton
              onClick={handleSave}
              className="flex items-center gap-1"
            >
              <p>Save changes</p>
              {(updateStatusMutation.status === 'pending' ||
                updateOrderMutation.status === 'pending') && (
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
