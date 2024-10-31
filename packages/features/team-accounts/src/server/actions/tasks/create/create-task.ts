'use server';

import { Task, Subtask } from '../../../../../../../../apps/web/lib/tasks.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { getUserById } from '../../members/get/get-member-account';
import { Activity } from '../../../../../../../../apps/web/lib/activity.types';
import { addActivityAction } from '../../activity/create/create-activity';
import { checkAndUpdateTaskCompletion } from '../update/update-task';

export const createNewTask = async (
    task: Task.Insert,
) => {
    try {
        const { subtasks, ...taskWithoutSubtasks } = task;
        const client = getSupabaseServerComponentClient();
        
        const { data: userData, error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);

        // Get the positions of existing tasks with the same order id
        const { data: existingTasks, error: fetchError } = await client
            .from('tasks')
            .select('position')
            .eq('order_id', taskWithoutSubtasks.order_id)
            .order('position', { ascending: true });

        if (fetchError) throw new Error(fetchError.message);

        // Determine the next available position
        const existingPositions = existingTasks.map(task => task.position);
        let newPosition = 0;
        
        for (let i = 0; i <= existingPositions.length + 1; i++) {
            if (!existingPositions.includes(i)) {
                newPosition = i;
                break;
            }
        }

        // Assign the calculated position
        const taskToInsert = { ...taskWithoutSubtasks, position: newPosition };

        // Insert the task with the new position
        const { data: taskData, error: taskDataError } = await client
            .from('tasks')
            .insert(taskToInsert)
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        // return taskData;

        const actualName = await getUserById(userData.user.id);

        const message = `has added a new task: ${task.name}`;
        const activity = {
          actor: actualName.name,
          action: Activity.Enums.ActionType.CREATE,
          type: Activity.Enums.ActivityType.TASK,
          message,
          value: task.name ?? '',
          preposition: 'named',
          order_id: Number(task.order_id),
          user_id: userData.user.id,
        };
        await addActivityAction(activity);

        return taskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}

export const createNewSubtask = async (
    subtask: Subtask.Insert,
) => {
    try {
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);

        // Get the positions of existing tasks with the same partner task id
        const { data: existingSubtasks, error: fetchError } = await client
            .from('subtasks')
            .select('position')
            .eq('parent_task_id', subtask.parent_task_id)
            .order('position', { ascending: true });

        if (fetchError) throw new Error(fetchError.message);

        // Determine the next available position
        const existingPositions = existingSubtasks.map(subtask => subtask.position);
        let newPosition = 0;
        
        for (let i = 0; i <= existingPositions.length + 1; i++) {
            if (!existingPositions.includes(i)) {
                newPosition = i;
                break;
            }
        }

        // Assign the calculated position
        const subtaskToInsert = { ...subtask, position: newPosition };
        
        const { data: subtaskData, error: taskDataError } = await client
            .from('subtasks')
            .insert(
                subtaskToInsert
            )
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        if (subtask.parent_task_id) {
            await checkAndUpdateTaskCompletion(subtask.parent_task_id);
        }

        return subtaskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}