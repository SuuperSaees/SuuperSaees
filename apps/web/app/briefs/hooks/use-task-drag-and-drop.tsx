import { useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";

import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Task, Subtask } from "~/lib/tasks.types";
import { useEffect } from "react";

export function useTaskDragAndDrop(tasks:Task.Type[] | Subtask.Type[]){
  const [taskList, setTaskList] = useState(tasks)
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });

  useEffect(() => {
    setTaskList(tasks);
  }, [tasks]);
  
  const mouseSensor = useSensor(MouseSensor, {
    // Require the mouse to move by 10 pixels before activating
    activationConstraint: {
      distance: 10,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    // Press delay of 250ms, with tolerance of 5px of movement
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

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

  function handleDragEnd(event: DragEndEvent){
    const {active, over} = event;
    const oldIndex = taskList.findIndex(task => task.id === active.id);
    const newIndex = taskList.findIndex(task => task.id === over?.id);
    setTaskList(arrayMove(taskList,oldIndex,newIndex))
    setIsDragging(false);
    setActiveId(null);
    setDragTask({
      isDragging: false,
      type: null,
    });
  }

  return{
    dragTask,
    isDragging,
    taskList,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  }

  
}