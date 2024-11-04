import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Check, Pencil } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Spinner } from '@kit/ui/spinner';

import { updateOrder } from '~/team-accounts/src/server/actions/orders/update/update-order';
import { updateStatusById } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSubtaskById } from '~/team-accounts/src/server/actions/tasks/update/update-task';

interface EditStatusPopoverProps {
  status_id: number;
  status_name: string;
  status_color: string;
  order_id?: number;
  task_id?: string;
  mode?: 'order' | 'subtask';
  setValue: (value: string) => void;
}

function EditStatusPopover({
  status_id,
  status_name,
  status_color,
  order_id,
  task_id,
  mode,
  setValue,
}: EditStatusPopoverProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>(status_name);
  const [color, setColor] = useState<string>(status_color);
  const router = useRouter();
  const queryClient = useQueryClient()


  const colorOptions = [
    { name: 'light green', value: '#83fccc' },
    { name: 'light pink', value: '#f4a9fc' },
    { name: 'light yellow', value: '#f3fca9' },
    { name: 'light blue', value: '#a9e6fc' },
    { name: 'light purple', value: '#dba9fc' },
    { name: 'light red', value: '#fca9af' },
  ];


  const updateStatusMutation = useMutation({
    mutationFn: () => updateStatusById(status_id, { status_name: name, status_color: color }),
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
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              defaultValue={name}
              onChange={(e) => setName(e.target.value)}
              className="h-8"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="grid gap-2">
            <Label>Color</Label>
            <RadioGroup
              value={color}
              onValueChange={setColor}
              className="flex flex-wrap gap-2"
            >
              {colorOptions.map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={option.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.value}
                    className="cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative h-8 w-8">
                      <div
                        className="absolute inset-0 rounded-full transition-all"
                        style={{ backgroundColor: option.value }}
                      />
                      {color === option.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="sr-only">{option.name}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
              {(updateStatusMutation.status === 'pending' || updateOrderMutation.status === 'pending') && <Spinner className="h-4 w-4" />}
            </ThemedButton>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}

export default EditStatusPopover;
