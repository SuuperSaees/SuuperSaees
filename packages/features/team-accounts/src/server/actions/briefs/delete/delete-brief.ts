'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomResponse, CustomError, ErrorBriefOperations } from '../../../../../../../../packages/shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
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
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error deleting the brief: ${briefId}`,
        ErrorBriefOperations.FAILED_TO_DELETE_BRIEF,
      );
    }

    // If there are related form_field_ids, delete them from the form_fields table
    if (formFieldData && formFieldData.length > 0) {
      const formFieldIds = formFieldData.map(item => item.form_field_id);
      
      const { error: deleteFieldsError } = await client
        .from('form_fields')
        .delete()
        .in('id', formFieldIds);
      
      if (deleteFieldsError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          'Error deleting the related form_fields',
          ErrorBriefOperations.FAILED_TO_DELETE_FORM_FIELDS,
        );
      }
    }

    // Delete the related brief_form_fields from the brief_form_fields table
    const { error: deleteBriefFieldsError } = await client.from('brief_form_fields').delete().eq('brief_id', briefId);
    if (deleteBriefFieldsError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        'Error deleting the related brief_form_fields',
        ErrorBriefOperations.FAILED_TO_DELETE_FORM_FIELDS,
      );
    }
    return CustomResponse.success(null, 'briefDeleted').toJSON();
  } catch (error) {
    console.error('Error al eliminar el brief:', error);
    return CustomResponse.error(error).toJSON();
  }
};
