import { useState } from 'react';

import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { updateStatusesPositions } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { toast } from 'sonner';
import { useEffect } from 'react';

export const useStatusDragAndDrop = (
  agencyStatuses: AgencyStatus.Type[]
) => {
  const [statuses, setStatuses] = useState(agencyStatuses);
  const queryClient = useQueryClient();

  const updateStatusesPositionsMutation = useMutation({
    mutationFn: async ({ statuses }: { statuses: AgencyStatus.Type[] }) => {
      return await updateStatusesPositions(statuses);
    },
    onSuccess: async () => {
      // toast.success('Successfully updated status positions');
      await queryClient.invalidateQueries({
        queryKey: ['statuses', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task positions');
    },
  });

  useEffect(() => {
    setStatuses(agencyStatuses);
  }, [agencyStatuses]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    let newStatuses = statuses

    if (active.id !== over?.id) {
      setStatuses((items) => {
        const oldIndex = items?.findIndex((item) => item.id === active.id)
        const newIndex = items?.findIndex((item) => item.id === over?.id)
        newStatuses = arrayMove(items, oldIndex, newIndex)
        return newStatuses
      })
      await updateStatusesPositionsMutation.mutateAsync({
        statuses: newStatuses,
      });
    }
  }

  return {
    sensors,
    handleDragEnd,
    statuses
  };
};
