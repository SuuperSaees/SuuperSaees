import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";



export const deleteTask = async (
    taskId: string
) => {
    try {  
      const client = getSupabaseServerComponentClient();
  
      // Delete the task from the database
      const { error } = await client
        .from('tasks')
        .update({
            deleted_on: new Date().toDateString()
        })
        .eq('id', taskId);
  
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting the task:', error);
      throw error;
    }
  };



export const deleteSubtask = async (
    subtaskId: string
) => {
    try {  
      const client = getSupabaseServerComponentClient();
  
      // Delete the subtask from the database
      const { error } = await client
        .from('subtasks')
        .update({
            deleted_on: new Date().toDateString()
        })
        .eq('id', subtaskId);
  
      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error deleting the task:', error);
      throw error;
    }
  };