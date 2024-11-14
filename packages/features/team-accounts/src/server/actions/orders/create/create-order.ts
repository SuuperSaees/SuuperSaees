'use server';

import { CustomError, CustomResponse, ErrorBriefOperations, ErrorOrderOperations, ErrorOrganizationOperations } from '@kit/shared/response';
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

export const createOrders = async (
  orders: OrderInsert[],
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

    const { data: roleData, error: roleError } = await client
      .from('accounts_memberships')
      .select('account_role')
      .eq('user_id', userId)
      .single();
    if (roleError)
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        roleError.message,
        ErrorOrganizationOperations.FAILED_TO_ASSOCIATE_ROLE,
      );

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
      orders[0]?.title ??
      `Order from ${emailData.email}`;

    let defaultStatusId = 1;
    const { data: statusData, error: statusError } = await client
      .from('agency_statuses')
      .select('id')
      .eq('status_name', 'pending')
      .eq('agency_id', agencyOrganizationData.id)
      .single();
    if (statusError) throw new Error(statusError.message);

    defaultStatusId = statusData?.id;

    const ordersToInsert = orders.map(
      ({ fileIds: _fileIds, ...orderWithoutFileIds }) => ({
        ...orderWithoutFileIds,
        title: titleFromBrief,
        customer_id: userId,
        client_organization_id: clientOrganizationId ?? '',
        propietary_organization_id:
          agencyOrganizationData.primary_owner_user_id,
        agency_id: agencyOrganizationData.id,
        status_id: defaultStatusId,
        brief_ids:
          Array.from(briefIds).length > 0 ? Array.from(briefIds) : undefined,
      }),
    );

    // Step 3: Insert orders into the database
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .insert(ordersToInsert)
      .select()
      .single();
    if (orderError)
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `
      There was an error creating the order: ${orderError.message}`,
        ErrorOrderOperations.FAILED_TO_CREATE_ORDER,
      );

    // Step 3.5: Insert brief responses if present
    if (briefResponses && briefResponses.length > 0) {
      const { error: briefResponsesError } = await client
        .from('brief_responses')
        .insert(briefResponses);

      if (briefResponsesError)
        throw new CustomError(
          HttpStatus.Error.BadRequest,
          `Error creating the order brief, ${briefResponsesError.message}`,
          ErrorBriefOperations.FAILED_TO_CREATE_BRIEF_RESPONSES,
        );
    }

    // Step 4: Insert brief order files if present
    const { data: formFieldIds, error: formFieldIdsError } = await client
      .from('brief_form_fields')
      .select('form_field_id')
      .in('brief_id', Array.from(briefIds));

    if (formFieldIdsError)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        formFieldIdsError.message,
        ErrorBriefOperations.FAILED_TO_GET_FORM_FIELDS,
      );

    const { data: fileFields, error: fileFieldsError } = await client
      .from('form_fields')
      .select('id')
      .in(
        'id',
        formFieldIds.map((f) => f.form_field_id),
      )
      .eq('type', 'file');

    if (fileFieldsError)
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error getting file fields: ${fileFieldsError.message}`,
        ErrorBriefOperations.FAILED_TO_GET_FORM_FIELDS,
      );

    const { data: filesFromBrief, error: filesFromBriefError } = await client
      .from('brief_responses')
      .select('response')
      .in(
        'order_id',
        ordersToInsert.map((o) => o.uuid),
      )
      .in(
        'form_field_id',
        fileFields.map((f) => f.id),
      );

    if (filesFromBriefError) throw new Error(filesFromBriefError.message);

    const fileIdsFromBrief = filesFromBrief
      .map((f) => f.response.split(',').map((id) => id.trim()))
      .flat();

    // Step 5: Insert order files if present
    for (const order of orders) {
      // Join the fileIds of the order with those of the brief form fields
      const combinedFileIds = [...(order.fileIds ?? []), ...fileIdsFromBrief];

      // If there are files to insert
      if (combinedFileIds.length > 0) {
        for (const fileId of combinedFileIds) {
          if (fileId) {
            const orderFileToInsert = {
              order_id: orderData.uuid,
              file_id: fileId.trim(),
            };

            const { error: orderFilesError } = await client
              .from('order_files')
              .insert(orderFileToInsert);

            if (orderFilesError)
              throw new CustomError(
                HttpStatus.Error.BadRequest,
                orderFilesError.message,
                ErrorOrderOperations.FAILED_TO_INSERT_FILES,
              );
          }
        }
      }
    }

    // Step 6: Assign agency members to the order
    const agencyRoles = new Set([
      'agency_owner',
      'agency_member',
      'agency_project_manager',
    ]);

    if (agencyRoles.has(roleData.account_role)) {
      const assignationData = {
        agency_member_id: userId,
        order_id: orderData.id,
      };
      const { error: assignedOrdersError } = await client
        .from('order_assignations')
        .insert(assignationData);
      if (assignedOrdersError)
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          'Error adding order assignements',
          ErrorOrderOperations.FAILED_TO_ADD_ASSIGNEES,
        );
    }

    // Step 7: add order followers if present
    if (orderFollowers && orderFollowers.length > 0) {
      const { error: followUpError } = await client
        .from('order_followers')
        .insert(
          orderFollowers.map((followerId) => ({
            order_id: orderData.id,
            client_member_id: followerId,
          })),
        );
      if (followUpError)
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          'Error adding order followers',
          ErrorOrderOperations.FAILED_TO_ADD_FOLLOWERS,
        );
    }

    // Step 8: Add order follow-up for client owners/members
    if (['client_owner', 'client_member'].includes(roleData.account_role)) {
      const followUpData = {
        order_id: orderData.id,
        client_member_id: userId,
      };

      const { error: followUpError } = await client
        .from('order_followers')
        .insert(followUpData);
      if (followUpError)
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          'Error adding order followers',
          ErrorOrderOperations.FAILED_TO_ADD_FOLLOWERS,
        );
    }

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

    // Step 9: Redirect to orders page after successful order creation

    return CustomResponse.success(orderData, 'orderCreated').toJSON();
  } catch (error) {
    console.error(error);
    return CustomResponse.error(error).toJSON();
  }
};