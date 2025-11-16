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
    console.error('Error updating tasks:', error);
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

    const { assigned_to, followers, ...subtaskWithoutAssignedTo } = subtask;

    const { data: subtaskData, error: taskDataError } = await client
      .from('subtasks')
      .update(subtaskWithoutAssignedTo)
      .eq('id', subtaskId);
    if (taskDataError) throw new Error(taskDataError.message);

    if (subtask.parent_task_id) {
      await checkAndUpdateTaskCompletion(subtask.parent_task_id);
    }

    return subtaskData;
  } catch (error) {
    console.error('Error updating subtask updateSubtaskById:', error);
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
      .eq('parent_task_id', parentId)
      .is('deleted_on', null);
    if (subtasksError) throw new Error(subtasksError.message);

    // Check if all subtasks are completed
    const allCompleted = subtasks?.every((subtask) => subtask.completed);

    // If all subtasks are completed, update the parent task
    if (allCompleted) {
      // Check if the main task is already completed
      const { data: taskStatus, error: taskStatusError } = await client
        .from('tasks')
        .select('completed')
        .eq('id', parentId)
        .single();
      if (taskStatusError) throw new Error(taskStatusError.message);

      // If already completed, exit the function to avoid redundancy
      if (taskStatus?.completed) return;


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
    } else {
      const { error: taskError } = await client
        .from('tasks')
        .update({ completed: false })
        .eq('id', parentId)
        .select('name, order_id')
        .single();
      if (taskError) throw new Error(taskError.message);
    }
  } catch (error) {
    console.error('Error checking and updating task completion:', error);
  }
};


export const updateSubtaskAssigns = async (
  subtaskId: Subtask.Type['id'],
  agencyMemberIds: string[],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // 1. Fetch existing assignments to determine if you need to delete any
    const { data: existingAssignments, error: fetchError } = await client
      .from('subtask_assignations')
      .select('agency_member_id')
      .eq('subtask_id', subtaskId);

    if (fetchError) throw fetchError;

    // Extract existing IDs
    const existingIds =
      existingAssignments?.map((assign) => assign.agency_member_id) || [];

    // Determine IDs to add and remove
    const idsToAdd = agencyMemberIds.filter((id) => !existingIds.includes(id));
    const idsToRemove = existingIds.filter(
      (id) => !agencyMemberIds.includes(id),
    );

    // 2. Remove old assignments
    if (idsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('subtask_assignations')
        .delete()
        .in('agency_member_id', idsToRemove)
        .eq('subtask_id', subtaskId);

      if (deleteError) throw deleteError;
    }

    // 3. Upsert new assignments
    const newAssignments = idsToAdd.map((id) => ({
      subtask_id: subtaskId,
      agency_member_id: id,
    }));

    const { error: upsertError } = await client
      .from('subtask_assignations')
      .upsert(newAssignments)
      .select();

    if (upsertError) throw upsertError;

  } catch (error) {
    console.error('Error updating subtask assignments:', error);
    throw new Error('Failed to update subtask assignments');
  }
};

export const updateSubtaskFollower = async (
  subtaskId: Subtask.Type['id'],
  followerIds: string[],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // 1. Fetch existing followers to determine if you need to delete any
    const { data: existingAssignments, error: fetchError } = await client
      .from('subtask_followers')
      .select('client_member_id')
      .eq('subtask_id', subtaskId);

    if (fetchError) throw fetchError;

    // Extract existing IDs
    const existingIds =
      existingAssignments?.map((assign) => assign.client_member_id) || [];

    // Determine IDs to add and remove
    const idsToAdd = followerIds.filter((id) => !existingIds.includes(id));
    const idsToRemove = existingIds.filter(
      (id) => !followerIds.includes(id),
    );

    // 2. Remove old assignments
    if (idsToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('subtask_followers')
        .delete()
        .in('client_member_id', idsToRemove)
        .eq('subtask_id', subtaskId);

      if (deleteError) throw deleteError;
    }

    // 3. Upsert new followers
    const newFollowers = idsToAdd.map((id) => ({
      subtask_id: subtaskId,
      client_member_id: id,
    }));

    const { error: upsertError } = await client
      .from('subtask_followers')
      .upsert(newFollowers)
      .select();

    if (upsertError) throw upsertError;

  } catch (error) {
    console.error('Error updating subtask followers:', error);
    throw new Error('Failed to update subtask followers');
  }
};