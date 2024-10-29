'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  Subtask,
  Task,
} from '../../../../../../../../apps/web/lib/tasks.types';

export const updateTaskNameById = async (taskId: string, taskName: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: taskData, error: taskDataError } = await client
      .from('tasks')
      .update({ name: taskName })
      .eq('id', taskId);
    if (taskDataError) throw new Error(taskDataError.message);

    return taskData;
  } catch (error) {
    console.error('Error creating tasks:', error);
  }
};

export const updateTaskById = async (taskId: string, task: Task.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: taskData, error: taskDataError } = await client
      .from('tasks')
      .update(task)
      .eq('id', taskId);
    if (taskDataError) throw new Error(taskDataError.message);

    return taskData;
  } catch (error) {
    console.error('Error updating tasks:', error);
  }
};

export const updateTasksPositions = async (tasks: Task.Type[]) => {
  try {
    const updates = tasks.map((task, index) => ({
      id: task.id,
      position: index,
    }));
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: tasksData, error: taskDataError } = await client
      .from('tasks')
      .upsert(updates, { onConflict: ['id'] });

    if (taskDataError) throw new Error(taskDataError.message);

    return tasksData;
  } catch (error) {
    console.error('Error updating tasks:', error);
  }
};

export const updateSubtasksPositions = async (subtasks: Subtask.Type[]) => {
  try {
    const updates = subtasks.map((subtask, index) => ({
      id: subtask.id,
      position: index,
    }));
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: subtasksData, error: taskDataError } = await client
      .from('subtasks')
      .upsert(updates, { onConflict: ['id'] });

    if (taskDataError) throw new Error(taskDataError.message);

    return subtasksData;
  } catch (error) {
    console.error('Error updating tasks:', error);
  }
};

export const updateSubtaskById = async (
  subtaskId: string,
  subtask: Subtask.Insert,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    const { data: subtaskData, error: taskDataError } = await client
      .from('subtasks')
      .update(subtask)
      .eq('id', subtaskId);
    if (taskDataError) throw new Error(taskDataError.message);

    return subtaskData;
  } catch (error) {
    console.error('Error creating tasks:', error);
  }
};
