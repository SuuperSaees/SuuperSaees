'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { CustomResponse, CustomError, ErrorBriefOperations } from '../../../../../../../../packages/shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { revalidatePath } from 'next/cache';
export const deleteBrief = async (briefId: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    
    // Update the brief with current timestamp instead of deleting it
    const { error: updateError } = await client
      .from('briefs')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', briefId);

    if (updateError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error updating the brief: ${briefId}`,
        ErrorBriefOperations.FAILED_TO_DELETE_BRIEF,
      );
    }

    revalidatePath('/briefs');
    return CustomResponse.success(null, 'briefDeleted').toJSON();
  } catch (error) {
    console.error('Error al actualizar el brief:', error);
    return CustomResponse.error(error).toJSON();
  }
};
