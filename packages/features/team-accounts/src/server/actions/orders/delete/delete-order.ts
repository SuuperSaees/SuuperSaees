'use server'
import { getSupabaseServerComponentClient } from "@kit/supabase/server-component-client";
import { CustomResponse, CustomError, ErrorOrderOperations } from "@kit/shared/response";
import { HttpStatus } from "../../../../../../../shared/src/response/http-status";

export const deleteOrderById = async (
  orderId: number
) => {
  try {  
    const client = getSupabaseServerComponentClient();

    const { error } = await client
      .from('orders_v2')
      .update({
          deleted_on: new Date().toDateString()
      })
      .eq('id', orderId);

    if (error) {
      throw new CustomError(HttpStatus.Error.InternalServerError, `
        Error deleting the order: ${error.message},
      `, ErrorOrderOperations.FAILED_TO_DELETE_ORDER);
    }
    return CustomResponse.success(null, 'orderDeleted').toJSON();
  } catch (error) {
    console.error('Error deleting the order:', error);
    return CustomResponse.error(error).toJSON();
  }
};