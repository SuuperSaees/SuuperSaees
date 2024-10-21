'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const deleteBrief = async (briefId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    // Get related form_field_ids from brief_form_fields
    const { data: formFieldData, error: fetchError } = await client
      .from('brief_form_fields')
      .select('form_field_id')
      .eq('brief_id', briefId);
    
    if (fetchError) {
      throw new Error(fetchError.message);
    }

    // Delete the brief from the briefs table
    const { error: deleteError } = await client.from('briefs').delete().eq('id', briefId);
    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // If there are related form_field_ids, delete them from the form_fields table
    if (formFieldData && formFieldData.length > 0) {
      const formFieldIds = formFieldData.map(item => item.form_field_id);
      
      const { error: deleteFieldsError } = await client
        .from('form_fields')
        .delete()
        .in('id', formFieldIds);
      
      if (deleteFieldsError) {
        throw new Error(deleteFieldsError.message);
      }
    }

    // Delete the related brief_form_fields from the brief_form_fields table
    const { error: deleteBriefFieldsError } = await client.from('brief_form_fields').delete().eq('brief_id', briefId);
    if (deleteBriefFieldsError) {
      throw new Error(deleteBriefFieldsError.message);
    }
  } catch (error) {
    console.error('Error al eliminar el brief:', error);
  }
};
