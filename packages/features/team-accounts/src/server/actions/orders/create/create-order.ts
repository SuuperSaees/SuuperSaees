'use server';

import {
  CustomError,
  CustomResponse,
  ErrorOrderOperations,
  ErrorOrganizationOperations,
} from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { hasPermissionToCreateOrder } from '../../permissions/orders';
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
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw new Error(userError.message);
    const userId = userData.user.id;

    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select()
      .eq('id', userId)
      .single();
    if (accountError) throw new Error(accountError.message);

    const { data: clientData, error: clientError } = await client
      .from('clients')
      .select('*')
      .eq('user_client_id', userId)
      .single();
    if (clientError && clientError.code !== 'PGRST116') {
      console.error('clientError', clientError);
      throw new Error(clientError.message);
    }

    const agencyClientId =
      clientData?.agency_id ?? accountData.organization_id ?? '';
    const clientOrganizationId =
      clientData?.organization_client_id ?? accountData.organization_id;

    const { data: agencyOrganizationData, error: agencyOrganizationError } =
      await client
        .from('accounts')
        .select('id, primary_owner_user_id, name')
        .eq('id', agencyClientId)
        .single();

    if (agencyOrganizationError)
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        'There was an error trying to get the agency organization for the client',
        ErrorOrganizationOperations.ORGANIZATION_NOT_FOUND,
      );

    const { data: emailData, error: emailError } = await client
      .from('accounts')
      .select('id, email')
      .eq('id', agencyOrganizationData.primary_owner_user_id)
      .single();
    if (emailError) throw new Error(emailError.message);

    // Step 1: Check if the user has permission to create orders
    const hasPermission = await hasPermissionToCreateOrder(
      agencyClientId,
      clientOrganizationId ?? '',
    );
    if (!hasPermission) {
      throw new CustomError(
        HttpStatus.Error.Unauthorized,
        'You do not have permission to create orders',
        ErrorOrderOperations.INSUFFICIENT_PERMISSIONS,
      );
    }

    // Step 2: Prepare the orders for insertion
    const briefIds = new Set<string>(
      briefResponses?.map((response) => response.brief_id) ?? [],
    );

    const titleFromBrief =
      briefResponses?.[0]?.response ??
      order?.title ??
      `Order from ${emailData.email}`;

    const orderToInsert = {
      ...order,
      title: titleFromBrief,
      customer_id: userId,
      client_organization_id: clientOrganizationId ?? '',
      propietary_organization_id: agencyOrganizationData.primary_owner_user_id,
      agency_id: agencyOrganizationData.id,
      brief_ids:
        Array.from(briefIds).length > 0 ? Array.from(briefIds) : undefined,
    };
    delete orderToInsert.fileIds;

    console.log('orderToInsert', orderToInsert);
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
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        orderError.message,
        ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
      );
    }

    console.log('orderTransaction', orderData);
    // Step 9: Send email notification
    if (emailData.email) {
      await sendOrderCreationEmail(
        emailData.email,
        orderData.id.toString(),
        orderData,
        agencyOrganizationData.name ?? '',
        userId,
      );
    }

    return CustomResponse.success(orderData, 'orderCreated').toJSON();
  } catch (error) {
    console.error(error);
    // Remove files (files table) from the database and storage. Is the only thing that not works with transactions.
    // Files are uploaded independently

    return CustomResponse.error(error).toJSON();
  }
};
