'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import {
  Subtask,
  Task,
} from '../../../../../../../../apps/web/lib/tasks.types';
import { addActivityAction } from '../../activity/create/create-activity';
import { getUserById } from '../../members/get/get-member-account';

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

    if (subtask.parent_task_id) {
      await checkAndUpdateTaskCompletion(subtask.parent_task_id);
    }

    return subtaskData;
  } catch (error) {
    console.error('Error creating tasks:', error);
  }
};

export const checkAndUpdateTaskCompletion = async (parentId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);

    // Get all subtasks with the same parent_id
    const { data: subtasks, error: subtasksError } = await client
      .from('subtasks')
      .select('completed')
      .eq('parent_task_id', parentId);
    if (subtasksError) throw new Error(subtasksError.message);

    // Check if all subtasks are completed
    const allCompleted = subtasks?.every((subtask) => subtask.completed);

    // If all subtasks are completed, update the parent task
    if (allCompleted) {
      const { data: taskData, error: taskError } = await client
        .from('tasks')
        .update({ completed: true })
        .eq('id', parentId)
        .select('name, order_id')
        .single();
      if (taskError) throw new Error(taskError.message);

      const actualName = await getUserById(userData.user.id);

      const message = `has completed the task: ${taskData.name}`;
      const activity = {
        actor: actualName.name,
        action: Activity.Enums.ActionType.COMPLETE,
        type: Activity.Enums.ActivityType.TASK,
        message,
        value: taskData.name ?? '',
        preposition: 'named',
        order_id: Number(taskData.order_id),
        user_id: userData.user.id,
      };
      await addActivityAction(activity);
    }
  } catch (error) {
    console.error('Error checking and updating task completion:', error);
  }
};
