import { useEffect, useState } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Subtask, Task } from '~/lib/tasks.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNewTask } from '~/team-accounts/src/server/actions/tasks/create/create-task';
import { toast } from 'sonner';
import { 
  updateTaskById, 
  updateTaskNameById, 
  updateTasksPositions 
} from '~/team-accounts/src/server/actions/tasks/update/update-task';
import { deleteTaskById } from '~/team-accounts/src/server/actions/tasks/delete/delete-task';
import { getTasks } from '~/team-accounts/src/server/actions/tasks/get/get-tasks';
import {
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export const useRealTimeTasks = (orderId: string) => {
  const supabase = useSupabase();
  const [tasks, setTasks] = useState<Task.Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // Drag and drop states
  const [isDragging, setIsDragging] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragTask, setDragTask] = useState({
    isDragging: false,
    type: null,
  });

  const queryClient = useQueryClient();

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


  useEffect(() => {
    // Handler para los cambios de tarea
    const handleTaskChange = (payload: { eventType: string; new: Task.Type; old: Task.Type }) => {
      const { eventType, new: newTask, old: oldTask } = payload;
  
      setTasks((prevTasks) => {
        switch (eventType) {
          case 'INSERT':
            return [...prevTasks, { ...newTask, subtasks: [] }];
          case 'UPDATE':
            return prevTasks.map((task) =>
              task.id === newTask.id ? { ...task, ...newTask } : task
            ).filter((task) => task.deleted_on === null);
          case 'DELETE':
            return prevTasks.filter((task) => task.id !== oldTask.id);
          default:
            return prevTasks;
        }
      });
    };
  
    const handleSubtaskChange = (payload: { eventType: string; new: Subtask.Type; old: Subtask.Type }) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;
  
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (task.id === (newSubtask?.parent_task_id ?? oldSubtask?.parent_task_id)) {
            const updatedSubtasks = [...(task.subtasks ?? [])];
  
            if (eventType === 'INSERT') {
              updatedSubtasks.push(newSubtask);
            } else if (eventType === 'UPDATE') {
              const index = updatedSubtasks.findIndex((st) => st.id === newSubtask.id);
              if (index !== -1) updatedSubtasks[index] = { ...updatedSubtasks[index], ...newSubtask };
            } else if (eventType === 'DELETE') {
              const index = updatedSubtasks.findIndex((st) => st.id === oldSubtask.id);
              if (index !== -1) updatedSubtasks.splice(index, 1);
            }
  
            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        })
      );
    };
  
    // Suscripción
    const channel = supabase
      .channel('tasks-and-subtasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, handleTaskChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subtasks' }, handleSubtaskChange)
      .subscribe();
  
    // Cargar datos iniciales
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const tasksData = await getTasks(orderId);
        setTasks(tasksData ?? []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchInitialData().catch((error) => console.error(error));
  
    return () => {
      channel.unsubscribe().catch((error) => console.error(error));
    };
  }, [orderId, supabase]);
  

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
  
    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
  
    if (oldIndex !== newIndex) {
      const updatedTasks = arrayMove(tasks, oldIndex, newIndex).map((task, index) => ({
        ...task,
        position: index,
      }));
  
      setTasks(updatedTasks); 
      await updateTaskPositions.mutateAsync({ tasks: updatedTasks }); 
    }
  
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

  // Mutations
  const createTask = useMutation({
    mutationFn: ({
      newTask,
    }: {
      newTask: Omit<Task.Type, 'id'>;
    }) => createNewTask(newTask),
    onSuccess: async () => {
      // toast.success('Successfully created new task');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error creating new task');
    },
  });

  const updateTaskName = useMutation({
    mutationFn: ({
      taskId,
      newName,
    }: {
      taskId: string;
      newName: string;
    }) => updateTaskNameById(taskId, newName),
    onSuccess: async () => {
      // toast.success('Successfully updated task name');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task name');
    },
  });

  const updateTask = useMutation({
    mutationFn: ({
      taskId,
      task,
    }: {
      taskId: string;
      task: Task.Type;
    }) => updateTaskById(taskId, task),
    onSuccess: async () => {
      // toast.success('Successfully updated task');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task');
    },
  });

  const updateTaskPositions = useMutation({
    mutationFn: ({
      tasks,
    }: {
      tasks: Task.Type[];
    }) => updateTasksPositions(tasks),
    onSuccess: async () => {
      // toast.success('Successfully updated task positions');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error updating task positions');
    },
  });

  const deleteTask = useMutation({
    mutationFn: ({
      taskId,
    }: {
      taskId: string;
    }) => deleteTaskById(taskId),
    onSuccess: async () => {
      // toast.success('Successfully deleted task');
      await queryClient.invalidateQueries({
        queryKey: ['tasks', 'all'],
      });
    },
    onError: () => {
      toast.error('Error deleting task');
    },
  });

  return {
    // Task state
    tasks,
    setTasks,
    loading,
    setLoading,
    
    // Task mutations
    createTask,
    updateTaskName,
    updateTask,
    updateTaskPositions,
    deleteTask,
    
    // Drag and drop
    dragTask,
    isDragging,
    sensors,
    handleDragStart,
    handleDragEnd,
    activeId,
  };
};