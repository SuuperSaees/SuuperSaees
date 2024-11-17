'use server';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
} from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { sendOrderCreationEmail } from '../send-mail/send-order-email';


type OrderInsert = Omit<
  Order.Insert,
  | 'customer_id'
  | 'client_organization_id'
  | 'agency_id'
  | 'propietary_organization_id'
> & {
  fileIds?: string[];
};

export const createOrder = async (
  order: OrderInsert,
  briefResponses?: Brief.Relationships.FormFieldResponses[],
  orderFollowers?: string[],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Prepare the orders for insertion
    const briefIds = briefResponses?.map((response) => response.brief_id) ?? [];

    const orderToInsert = {
      ...order,
      brief_ids: briefIds,
    };
    delete orderToInsert.fileIds;

    // Step 2: Insert order into the database as a transaction procedure
    // The rpc proccess includes: create order, create order files, create order followers and assign agency members
    const { data: orderData, error: orderError } = await client.rpc(
      'create_order',
      {
        _order: orderToInsert,
        _brief_responses: briefResponses ?? [],
        _order_followers: orderFollowers ?? [],
        _order_file_ids: order.fileIds ?? [],
      },
    );

    if (orderError) {
      console.error('Error in the order transaction:', orderError);
      if (orderError.code === '42501') {
        throw new CustomError(
          HttpStatus.Error.Unauthorized,
          orderError.message,
          ErrorOrderOperations.INSUFFICIENT_PERMISSIONS,
        );
      } else {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          orderError.message,
          ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
        );
      }
    }

    // Step 3: Send email notification
    await sendOrderCreationEmail(orderData.id.toString(), orderData).catch(
      (error) => {
        console.error('Error sending order creation email:', error);
      },
    );

    return CustomResponse.success(orderData, 'orderCreated').toJSON();
  } catch (error) {
    console.error('Error creating order:', error);
    // Remove files (files table) from the database and storage. Is the only thing that not works with transactions.
    // Files are uploaded independently

    return CustomResponse.error(error).toJSON();
  }
};