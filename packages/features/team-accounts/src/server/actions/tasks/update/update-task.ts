'use server';

import { Task, Subtask } from '../../../../../../../../apps/web/lib/tasks.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const updateTask = async (
    task: Task.Insert,
) => {
    try {
        const { subtasks, ...taskWithoutSubtasks } = task;
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);
        
        const { data: taskData, error: taskDataError } = await client
            .from('tasks')
            .update(
                taskWithoutSubtasks
            )
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        if (subtasks && subtasks.length > 0) {
            for (const subtask of subtasks) {
                const updatedSubtask = await updateSubtask(subtask);
                if (!updatedSubtask) throw new Error('Error updating subtask');
            }
        }

        return taskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}

export const updateSubtask = async (
    subtask: Subtask.Insert,
) => {
    try {
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);
        
        const { data: subtaskData, error: taskDataError } = await client
            .from('subtasks')
            .update(
                subtask
            )
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        return subtaskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}