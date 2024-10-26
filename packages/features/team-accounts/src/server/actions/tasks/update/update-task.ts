
'use server';

import { Subtask } from '../../../../../../../../apps/web/lib/tasks.types';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';


export const updateTask = async (
    taskId: string,
    taskName: string,
) => {
    try {
        const client = getSupabaseServerComponentClient();
        const { error: userError } = await client.auth.getUser();
        if (userError) throw new Error(userError.message);
        
        const { data: taskData, error: taskDataError } = await client
            .from('tasks')
            .update(
                { name: taskName }
            )
            .eq('id', taskId)
        if (taskDataError) throw new Error(taskDataError.message);

        return taskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}

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
            .update(
                subtask
            )
            .eq('id', subtaskId);
        if (taskDataError) throw new Error(taskDataError.message);

        return subtaskData;
        
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
}