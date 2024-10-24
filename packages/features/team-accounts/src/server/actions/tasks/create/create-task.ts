'use server';

import { Task, Subtask } from '../../../../../../../../apps/web/lib/tasks.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const createTask = async (
    task: Task.Insert,
) => {
    try {
        const { subtasks, ...taskWithoutSubtasks } = task;
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);
        
        const { data: taskData, error: taskDataError } = await client
            .from('tasks')
            .insert(
                taskWithoutSubtasks
            )
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        return taskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}

export const createSubtask = async (
    subtask: Subtask.Insert,
) => {
    try {
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);
        
        const { data: subtaskData, error: taskDataError } = await client
            .from('subtasks')
            .insert(
                subtask
            )
            .single();
        if (taskDataError) throw new Error(taskDataError.message);

        return subtaskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}