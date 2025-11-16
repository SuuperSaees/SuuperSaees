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
import {
  fetchCurrentUserAccount,
  getUserAccountById,
} from '../../members/get/get-member-account';
import { sendOrderCreationEmail } from '../send-mail/send-order-email';
import { getOrganizationByUserId } from '../../organizations/get/get-organizations';
import { textFormat } from '../../../../../../../../apps/web/app/utils/text-format';
import { revalidatePath } from 'next/cache';

type OrderInsert = Omit<
  Order.Insert,
  | 'customer_id'
  | 'client_organization_id'
  | 'agency_id'
  | 'propietary_organization_id'
> 

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
  
    const processedBriefResponses = briefResponses?.map(response => ({
      ...response,
      response: typeof response.response === 'string' ? textFormat.encode(response.response) : response.response
    }));

    // Step 2: Insert order into the database as a transaction procedure
    // The rpc proccess includes: create order, create order files, create order followers and assign agency members
    const { data: orderData, error: orderError } = await client.rpc(
      'create_order',
      {
        _order: orderToInsert,
        _brief_responses: processedBriefResponses ?? [],
        _order_followers: orderFollowers ?? [],
        _order_file_ids: [],
        _organization_id: undefined,
        _user_id: undefined,
        _user_role: undefined,
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

    // Step 3: Send email notification (Replace all this by receiving all data needed directly from props)
    const supabase = getSupabaseServerComponentClient();
    const userData = await fetchCurrentUserAccount(supabase);
    const clientData = orderFollowers?.length
      ? await getUserAccountById(supabase, orderFollowers?.[0] ?? '')
      : userData;

      // Samuel Santa at Suuper
    const userId = userData?.id ?? '';
    const clientName = clientData?.settings?.name ?? clientData?.name ?? '';

    const clientOrg = await getOrganizationByUserId( orderFollowers?.[0] ?? userId ?? '');
    const clientOrgName = clientOrg?.name ?? '';

    await sendOrderCreationEmail(
      orderData.id.toString(),
      orderData,
      userId,
      clientName,
      clientOrgName
    ).catch((error) => {
      console.error('Error sending order creation email:', error);
    });

    revalidatePath('/orders');
    return CustomResponse.success(orderData, 'orderCreated').toJSON();
  } catch (error) {
    console.error('Error creating order:', error);
    // Remove files (files table) from the database and storage. Is the only thing that not works with transactions.
    // Files are uploaded independently

    return CustomResponse.error(error).toJSON();
  }
};
