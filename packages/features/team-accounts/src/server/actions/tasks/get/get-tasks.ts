'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  Subtask,
  Task,
} from '../../../../../../../../apps/web/lib/tasks.types';

export const getTasks = async (orderId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: tasksData, error: tasksDataError } = await client
      .from('tasks')
      .select(`*, subtasks(*)`)
      .eq('order_id', orderId)
      .is('deleted_on', null);
    if (tasksDataError) throw new Error(tasksDataError.message);

    const tasks = tasksData
      .map((task: Task.Type) => {
        return {
          ...task,
          subtasks: task.subtasks
            ?.filter((subtask: Subtask.Type) => subtask.deleted_on === null)
            .map((subtask: Subtask.Type) => {
              return {
                ...subtask,
              };
            }),
        };
      })
      .filter((task) => task.deleted_on === null);

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};
