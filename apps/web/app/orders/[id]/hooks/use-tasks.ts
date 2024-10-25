import { useEffect, useState } from 'react';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { Subtask, Task } from '~/lib/tasks.types';

export const useRealTimeTasks = () => {
  const supabase = useSupabase();
  const [tasks, setTasks] = useState<Task.Type[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Handler for task changes
    const handleTaskChange = (payload: any) => {
      const { eventType, new: newTask, old: oldTask } = payload;

      if (eventType === 'INSERT') {
        setTasks((prevTasks) => [...prevTasks, { ...newTask, subtasks: [] }]);
      } else if (eventType === 'UPDATE') {
        setTasks(
          (prevTasks) =>
            prevTasks
              .map((task) =>
                task.id === newTask.id
                  ? {
                      ...task,
                      ...newTask,
                      subtasks: task.subtasks, // Preserve subtasks on task update
                    }
                  : task,
              )
              .filter((task) => task.deleted_on === null), // Filter out deleted tasks
        );
      } else if (eventType === 'DELETE') {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.id !== oldTask.id),
        );
      }
    };

    // Handler for subtask changes
    const handleSubtaskChange = (payload: any) => {
      const { eventType, new: newSubtask, old: oldSubtask } = payload;

      setTasks((prevTasks) => {
        return prevTasks.map((task) => {
          // Only update the task that owns this subtask
          if (
            task.id ===
            (newSubtask?.parent_task_id || oldSubtask?.parent_task_id)
          ) {
            const updatedSubtasks = [...(task.subtasks || [])];

            if (eventType === 'INSERT') {
              updatedSubtasks.push(newSubtask);
            } else if (eventType === 'UPDATE') {
              const index = updatedSubtasks.findIndex(
                (st) => st.id === newSubtask.id,
              );
              if (index !== -1) {
                updatedSubtasks[index] = {
                  ...updatedSubtasks[index],
                  ...newSubtask,
                };
              }
            } else if (eventType === 'DELETE') {
              const index = updatedSubtasks.findIndex(
                (st) => st.id === oldSubtask.id,
              );
              if (index !== -1) {
                updatedSubtasks.splice(index, 1);
              }
            }

            return { ...task, subtasks: updatedSubtasks };
          }
          return task;
        });
      });
    };

    // Subscribe to both tasks and subtasks changes
    const channel = supabase
      .channel('tasks-and-subtasks')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        handleTaskChange,
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subtasks' },
        handleSubtaskChange,
      )
      .subscribe();

    // Initial fetch of tasks with their subtasks
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select(
            `
                        *,
                        subtasks (*)
                    `,
          )
          .is('deleted_on', null);

        if (tasksError) throw tasksError;
        setTasks(tasksData || []);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData().catch((error) => console.error(error));

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const createTask = async (newTask: Omit<Task.Type, 'id'>) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select('*');

    if (error) {
      console.error('Error creating task:', error);
      return;
    }
  };

  const createSubtask = async (newSubtask: Omit<Subtask.Type, 'id'>) => {
    const { data, error } = await supabase
      .from('subtasks')
      .insert([newSubtask])
      .select('*');

    if (error) {
      console.error('Error creating subtask:', error);
      return;
    }
  };

  const updateTaskName = async (taskId: string, newName: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ name: newName })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task name:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        deleted_on: new Date().toISOString(),
      })
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    const { error: subtasksError } = await supabase
      .from('subtasks')
      .update({
        deleted_on: new Date().toISOString(),
      })
      .eq('parent_task_id', taskId);

    if (subtasksError) {
      console.error('Error deleting subtasks:', subtasksError);
    }
  };

  return {
    tasks,
    setTasks,
    createTask,
    createSubtask,
    updateTaskName,
    deleteTask,
    loading,
    setLoading,
  };
};
