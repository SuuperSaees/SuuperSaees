import { useState } from 'react';

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AgencyStatus } from '~/lib/agency-statuses.types';
import { updateStatusesPositions } from '~/team-accounts/src/server/actions/statuses/update/update-agency-status';
import { toast } from 'sonner';

export const useStatusDragAndDrop = (
  agency_id: string,
) => {
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [dragStatus, setDragStatus] = useState({
    isDragging: false,
    type: null,
  });


  const updateStatusesPositionsMutation = useMutation({
    mutationFn: async ({ statuses }: { statuses: AgencyStatus.Type[] }) => {
      return await updateStatusesPositions(statuses);
    },
    onSuccess: async () => {
      // toast.success('Successfully updated task positions');
      await queryClient.invalidateQueries({
        queryKey: ['statuses', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task positions');
    },
  });

  // Configure DnD sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('drag start');
    setIsDragging(true);
    setActiveId(event.active.id as string);
    const draggableData = event.active?.data?.current;

    if (draggableData?.type) {
      setDragStatus({
        isDragging: true,
        type: draggableData.type,
      });
    } else {
      setDragStatus({
        isDragging: false,
        type: null,
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    console.log('drag end');
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    let updatedStatuses: AgencyStatus.Type[] = [];

    queryClient.setQueryData(
      ['statuses', agency_id],
      (prevTasks: AgencyStatus.Type[] | undefined) => {
        if (!prevTasks) return [];
        const oldIndex = prevTasks.findIndex((task) => task.id === active.id);
        const newIndex = prevTasks.findIndex((task) => task.id === over.id);

        if (oldIndex === newIndex) return prevTasks;

        updatedStatuses = arrayMove(prevTasks, oldIndex, newIndex).map(
          (status, index) => ({
            ...status,
            position: index,
          }),
        );

        return updatedStatuses;
      },
    );

    await updateStatusesPositionsMutation.mutateAsync({ statuses: updatedStatuses });

    resetDragState();
  };

  const resetDragState = () => {
    setIsDragging(false);
    setActiveId(null);
    setDragStatus({
      isDragging: false,
      type: null,
    });
  };

  return {
    isDragging,
    activeId,
    dragStatus,
    handleDragStart,
    handleDragEnd,
    sensors,
  };
};
