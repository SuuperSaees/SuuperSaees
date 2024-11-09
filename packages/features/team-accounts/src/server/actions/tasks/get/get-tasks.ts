'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const getTasks = async (orderId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: tasksData, error: tasksDataError } = await client
      .from('tasks')
      .select(`*`)
      .eq('order_id', orderId)
      .is('deleted_on', null);
    if (tasksDataError) throw new Error(tasksDataError.message);

    return tasksData;
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
};

export const getSubtasks = async () => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: subtasksData, error: subtasksDataError } = await client
      .from('subtasks')
      .select(
        `*, followers:subtask_followers(*, accounts(id, name, email)), assigned_to:subtask_assignations(*, accounts(id, name, email))`,
      )
      .is('deleted_on', null);
    if (subtasksDataError) throw new Error(subtasksDataError.message);

    const subtasks = subtasksData.filter((task) => task.deleted_on === null);

    return subtasks;
  } catch (error) {
    console.error('Error fetching subtasks:', error);
  }
};

export const getSubtaskAssigns = async (subtaskId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: assignsData, error: assignsDataError } = await client
      .from('subtask_assignations')
      .select(`*, accounts(*)`)
      .eq('subtask_id', subtaskId);
    if (assignsDataError) throw new Error(assignsDataError.message);

    return assignsData;
  } catch (error) {
    console.error('Error fetching subtask assigns:', error);
  }
};

export const getSubtaskFollowers = async (subtaskId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: assignsData, error: assignsDataError } = await client
      .from('subtask_followers')
      .select(`*, accounts(*)`)
      .eq('subtask_id', subtaskId);
    if (assignsDataError) throw new Error(assignsDataError.message);

    return assignsData;
  } catch (error) {
    console.error('Error fetching subtask assigns:', error);
  }
};
