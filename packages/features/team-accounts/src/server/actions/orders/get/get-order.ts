'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { User as ServerUser } from '../../../../../../../../apps/web/lib/user.types';
import { getUrlFile } from '../../files/get/get-files';
import { hasPermissionToReadOrderDetails } from '../../permissions/orders';
import { hasPermissionToReadOrders } from '../../permissions/permissions';

export const getBriefQuestionsAndAnswers = async (
  briefIds: string[],
  orderId: string,
) => {
  const client = getSupabaseServerComponentClient();

  // Get the relationships of brief_form_files for the brief_id
  const { data: briefFormFilesData, error: briefFormFilesError } = await client
    .from('brief_form_fields')
    .select('form_field_id')
    .in('brief_id', briefIds);

  if (briefFormFilesError) throw briefFormFilesError;

  // Extract form_field_id from relationships
  const formFieldIds = briefFormFilesData.map((file) => file.form_field_id);

  // Get the questions from the form_fields table, including options
  const { data: formFieldsData, error: formFieldsError } = await client
    .from('form_fields')
    .select('id, description, label, type, options') // Include "options"
    .in('id', formFieldIds);

  if (formFieldsError) throw formFieldsError;

  // Get the responses corresponding to the orderID
  const { data: briefResponsesData, error: briefResponsesError } = await client
    .from('brief_responses')
    .select('response, form_field_id')
    .in('form_field_id', formFieldIds)
    .eq('order_id', orderId);

  if (briefResponsesError) throw briefResponsesError;

  let descriptionContent = '';
  for (const question of formFieldsData) {
    const response = briefResponsesData.find(
      (res) => res.form_field_id === question.id,
    );
    const unvalidResponseTypes = new Set(['h1', 'h2', 'h3', 'h4']);

    if (unvalidResponseTypes.has(question.type)) continue;

    let result;

    if (response) {
      try {
        // If the field type is multiple_choice, select, or dropdown, map the values to labels
        if (['multiple_choice', 'select', 'dropdown'].includes(question.type)) {
          const selectedValues = response.response
            .split(',')
            .map((val) => val.trim()); // Split multiple values
          const options = question.options ?? [];

          // Map each selected value to its corresponding label
          const mappedLabels = selectedValues
            .map((value) => {
              const option = options.find((opt) => opt.value === value);
              return option ? option.label : value; // Fallback to value if no matching label
            })
            .join(', ');

          result = mappedLabels;
        } else if (question.type === 'date') {
          // Convert date responses to DD/MM/YYYY format
          const date = new Date(response.response);
          result = date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          });
        } else if (question.type === 'file') {
          const uploadedFiles = response.response
            .split(',')
            .map((val) => val.trim());

          const mappedFiles = await Promise.all(
            uploadedFiles.map(async (fileId) => {
              const file = await getUrlFile(fileId);
              return file;
            }),
          );

          result = mappedFiles.map((file) => file).join(', ');
        } else {
          result = response.response.replace(/_/g, ' ');
        }
      } catch (error) {
        result = response.response.replace(/_/g, ' ');
      }
    } else {
      result = 'No se proporcionó información';
    }

    // Concatenate question and answer
    descriptionContent += `<strong>${question.label}:</strong><br/>${result}<br/><br/>`;
  }

  return descriptionContent;
};

export const getOrderById = async (orderId: Order.Type['id']) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userError } = await client.auth.getUser();
    if (userError) throw userError.message;

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select(
        `*, client:accounts!customer_id(id, name, email, picture_url, organization_id, created_at), 
        messages(*, user:accounts(id, name, email, picture_url), files(*)), 
        activities(*, user:accounts(id, name, email, picture_url)),
          reviews(*, user:accounts(id, name, email, picture_url)), 
          files(*, user:accounts(id, name, email, picture_url)),
         assigned_to:order_assignations(agency_member:accounts(id, name, email, picture_url)),
         followers:order_followers(client_follower:accounts(id, name, email, picture_url))
        `,
      )
      .eq('id', orderId)
      .single();

    const userHasReadMessagePermission = await hasPermissionToReadOrderDetails(
      orderId,
      orderData?.agency_id ?? '',
      orderData?.client_organization_id ?? '',
    );

    if (!userHasReadMessagePermission) throw 'Unauthorized access to order';

    if (orderError) throw orderError.message;

    // fetch client organization with the order
    const { data: clientOrganizationData, error: clientOrganizationError } =
      await client
        .from('accounts')
        .select('name, slug')
        .eq('id', orderData.client_organization_id)
        .single();

    if (clientOrganizationError) throw clientOrganizationError.message;

    const proccesedData = {
      ...orderData,
      messages: orderData.messages.map((message) => {
        return {
          ...message,
          user: message.user,
        };
      }),
      client_organization: clientOrganizationData,
    };

    if (proccesedData.brief_ids) {
      const description = await getBriefQuestionsAndAnswers(
        proccesedData.brief_ids ? proccesedData.brief_ids : [],
        orderData.uuid,
      );
      proccesedData.description = description ?? '';
    }

    return proccesedData as Order.Relational;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export async function getOrderAgencyMembers(
  agencyId: ServerUser.Type['organization_id'],
  orderId: Order.Type['id'],
) {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;
    const userId = userAuthenticatedData?.user?.id;

    // Retrieve authenticated account information
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('organization_id, primary_owner_user_id')
      .eq('id', userId)
      .single();

    if (accountError) throw accountError;

    const { data: accountMembershipsData, error: accountMembershipsDataError } =
      await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', userId)
        .single();

    if (accountMembershipsDataError) throw accountMembershipsDataError;

    // Retrieve the order
    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select()
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (
      accountMembershipsData.account_role !== 'agency_owner' &&
      accountMembershipsData.account_role !== 'agency_member'
    ) {
      throw new Error('Unauthorized access to order agency members');
    }

    if (orderData.propietary_organization_id === accountData.organization_id) {
      const { data: agencyMembersData, error: agencyMembersError } =
        await client
          .from('accounts')
          .select('id, name, email, picture_url')
          .eq('organization_id', agencyId ?? accountData.organization_id);

      if (agencyMembersError) throw agencyMembersError;
      return agencyMembersData;
    }

    const { data: agencyMembersData, error: agencyMembersError } = await client
      .from('accounts')
      .select('id, name, email, picture_url')
      .eq('organization_id', agencyId ?? accountData.primary_owner_user_id);

    if (agencyMembersError) throw agencyMembersError;

    return agencyMembersData;
  } catch (error) {
    console.error('Error fetching order agency members:', error);
    throw error;
  }
}

export const getOrders = async () => {
  try {
    const orders = await hasPermissionToReadOrders();
    return orders;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export async function getAgencyClients(
  agencyId: string,
  orderId: Order.Type['id'],
) {
  try {
    const client = getSupabaseServerComponentClient();

    const { error: userAuthenticatedError, data: userAuthenticatedData } =
      await client.auth.getUser();

    if (userAuthenticatedError) throw userAuthenticatedError;
    const userId = userAuthenticatedData?.user?.id;

    // Retrieve authenticated account information
    const { data: accountData, error: accountError } = await client
      .from('accounts')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (accountError) throw accountError;

    const { data: accountMembershipsData, error: accountMembershipsDataError } =
      await client
        .from('accounts_memberships')
        .select('account_role')
        .eq('user_id', userId)
        .single();

    if (accountMembershipsDataError) throw accountMembershipsDataError;

    const userRoles = new Set([
      'agency_owner',
      'agency_member',
      'client_owner',
    ]);

    if (!userRoles.has(accountMembershipsData.account_role)) {
      throw new Error('Unauthorized access to agency clients');
    }

    const { data: orderData, error: orderError } = await client
      .from('orders_v2')
      .select('agency_id, client_organization_id')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    if (
      orderData.agency_id !== accountData.organization_id &&
      accountMembershipsData.account_role !== 'client_owner'
    ) {
      throw new Error('Unauthorized access to this order');
    }

    const { data: clientsData, error: clientsError } = await client
      .from('clients')
      .select('user_client_id')
      .eq('agency_id', agencyId)
      .eq('organization_client_id', orderData.client_organization_id)
      .neq('user_client_id', userId);

    if (clientsError) throw clientsError;

    const clientDetailsPromises = clientsData.map(async (clientCurrent) => {
      const { data: accountData, error: accountError } = await client
        .from('accounts')
        .select('id, name, email, picture_url')
        .eq('id', clientCurrent.user_client_id)
        .eq('is_personal_account', true)
        .single();

      if (accountError) throw accountError;

      return accountData;
    });

    const clientDetails = await Promise.all(clientDetailsPromises);

    return clientDetails;
  } catch (error) {
    console.error('Error fetching agency clients:', error);
    throw error;
  }
}

export async function getPropietaryOrganizationIdOfOrder(orderId: string) {
  try {
    const client = getSupabaseServerComponentClient();

    const { data: clientOrganizationData, error: clientOrganizationDataError } =
      await client
        .from('orders_v2')
        .select('client_organization_id')
        .eq('id', orderId)
        .single();

    if (clientOrganizationDataError) throw clientOrganizationDataError;

    return clientOrganizationData;
  } catch (error) {
    console.error('Error fetching Agency Owner User Id:', error);
  }
}
