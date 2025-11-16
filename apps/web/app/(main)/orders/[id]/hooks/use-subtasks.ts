import { useState } from 'react';


import { Subtask } from '~/lib/tasks.types';
import { DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useSubtaskMutations } from './subtasks/use-subtask-mutations';
import { useQueryClient } from '@tanstack/react-query';

type SubtaskType = Subtask.Type;

export const useRealTimeSubtasks = (orderId: string, orderAgencyId: string, userRole: string) => {
  const queryClient = useQueryClient();

  const { createSubtask, updateSubtask, updateSubtaskIndex, changeAgencyMembersAssigned, changeAgencyMembersFollowers,  orderAgencyMembers, orderAgencyClientsFollowers} = useSubtaskMutations(orderId, orderAgencyId, userRole);

  const searchUserOptions =
    orderAgencyMembers?.map((user) => ({
      picture_url: user.user_settings[0]?.picture_url ?? user.picture_url,
      value: user.id,
      label: user.user_settings[0]?.name ?? user.name,
  })) ?? [];

  const searchUserOptionsFollowers =
    orderAgencyClientsFollowers?.map((user) => ({
      picture_url: user?.settings[0]?.picture_url ?? user.picture_url,
      value: user.id,
      label: user?.settings[0]?.name ?? user.name,
  })) ?? [];

  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
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

  // Drag and drop handlers
  function handleDragStart(event: DragStartEvent) {
    setIsDragging(true);
    setActiveId(event.active.id as string);
    const draggableData = event.active?.data?.current;

    if (draggableData?.type) {
      setDragTask({
        isDragging: true,
        type: draggableData.type,
      });
    } else {
      setDragTask({
        isDragging: false,
        type: null,
      });
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
  
    if (!over) {
      resetDragState();
      return;
    }

    let updatedSubtasks: Subtask.Type[] = [];

    queryClient.setQueryData(
      ['subtasks', orderId],
      (prevSubtasks: SubtaskType[] | undefined) => {
        if (!prevSubtasks) return [];
        const oldIndex = prevSubtasks.findIndex((subtask) => subtask.id === active.id);
        const newIndex = prevSubtasks.findIndex((subtask) => subtask.id === over.id);

        if (oldIndex === newIndex) return prevSubtasks;

        updatedSubtasks = arrayMove(prevSubtasks, oldIndex, newIndex).map(
          (subtask, index) => ({
            ...subtask,
            position: index,
          }),
        );

        return updatedSubtasks;
      },
    );

    await updateSubtaskIndex.mutateAsync({ subtasks: updatedSubtasks });
  
    resetDragState();
  }

  const resetDragState = () => {
    setIsDragging(false);
    setActiveId(null);
    setDragTask({
      isDragging: false,
      type: null,
    });
  };

  return {
    // Subtask states
    createSubtask,

    // Subtask mutations
    updateSubtask,
    updateSubtaskIndex,

    // Drag and drop states
    isDragging,
    dragTask,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,

    //Assigned members
    searchUserOptions,
    changeAgencyMembersAssigned,

    //Followers
    searchUserOptionsFollowers,
    changeAgencyMembersFollowers
  };
};
