'use server';

import { SupabaseClient } from '@supabase/supabase-js';



import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import { fetchCurrentUser, fetchCurrentUserAccount, getPrimaryOwnerId, getUserRole } from '../../members/get/get-member-account';
import { fetchClientServices } from '../../services/get/get-services';

interface Configurations {
  includes?: Array<string>;
}

export const getBriefs = async (
  configurations: Configurations = {},
): Promise<
  Brief.Relationships.Services.Response[]
> => {
  try {
    const client = getSupabaseServerComponentClient<Database>();

    // Step 1: verify the user is authenticated
    const user = await fetchCurrentUser(client);

    // Step 3: get the role and define the valid roles
    const accountRole = await getUserRole();

    const validAgencyRoles = new Set([
      'agency_owner',
      'agency_project_manager',
      'agency_member',
    ]);

    const validClientRoles = new Set(['client_owner', 'client_member']);

    // Step 4: get the briefs for agency users
    if (validAgencyRoles.has(accountRole)) {
      // Step 4.1: get the propitary_organization_id
      const organizationOwnerId = await getPrimaryOwnerId();
      
      // Step 4.2: get the briefs for the organization
      const briefs = await fetchBriefsByOrgOwnerId(
        client,
        organizationOwnerId ?? '',
        configurations,
      );

      return briefs;
    } else if (validClientRoles.has(accountRole)) {
      // Step 4: get the briefs for client users

      // Step 4.1: get organization id of the user
      const clientOrganizationId = (
        await fetchCurrentUserAccount(client, user.id)
      ).organization_id;

      // Step 4.2: get the attached services to the client
      const clientServices = await fetchClientServices(
        client,
        clientOrganizationId ?? '',
      );

      const serviceIds = clientServices
        ?.map((service) => service.info?.id)
        .filter((id) => id != null);

      // Step 4.4: get the briefs for the services
      const serviceBriefs = await fetchServiceBriefs(client, serviceIds);
      const briefIds = serviceBriefs?.map((brief) => brief.brief_id);

      // Step 4.5: get the briefs for the client
      const briefs = await fetchClientBriefs(client, briefIds, serviceIds);

      return briefs;
    }

    return [];
  } catch (error) {
    console.error('Error obtaining briefs', error);
    throw error;
  }
};

export const fetchFormfieldsWithResponses = async (
  orderId: Order.Type['uuid'],
): Promise<Brief.Relationships.FormFieldResponse.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_responses')
      .select(
        `field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required),
        response,
        order_data:orders_v2(id, customer_id)
        `,
      )
      .eq('order_id', orderId);

    if (errorBriefFormFields) {
      throw new Error(`Failed to get brief responses for order (${orderId}), ${errorBriefFormFields.message}`);
    }

    const customerId = briefFormFields?.[0]?.order_data?.customer_id;

    if (!customerId) {
      throw new Error('Customer ID not found.');
    }

    const { data: userSettings, error: errorUserSettings } = await client
      .from('user_settings')
      .select('name')
      .eq('user_id', customerId)
      .single();

    if (errorUserSettings && errorUserSettings.code !== 'PGRST116') {
      // 'PGRST116' indicates no rows were found; any other error should be thrown
      throw new Error(`Error obtaining user settings at briefs: ${errorUserSettings.message}`);
    }

    return briefFormFields.map((field) => ({
      ...field,
      userSettings: userSettings ?? null,
    }));
    
  } catch (error) {
    console.error('Error obtaining brief fields', error);
    // throw error;
  }
};

export const fetchServiceBriefs = async (
  client: SupabaseClient<Database>,
  serviceIds: Service.Type['id'][],
) => {
  try {
    const { data: serviceBriefs, error: errorServiceBriefsIds } = await client
      .from('service_briefs')
      .select('brief_id')
      .in('service_id', serviceIds);

    if (errorServiceBriefsIds)
      throw new Error(
        `Error getting the service briefs, ${errorServiceBriefsIds.message}`,
      );

    return serviceBriefs;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchClientBriefs = async (
  client: SupabaseClient<Database>,
  briefIds: Brief.Type['id'][],
  serviceIds?: Service.Type['id'][],
): Promise<Brief.Relationships.Services.Response[]> => {

  let query = client
  .from('briefs')
  .select(
    `id, created_at, name, propietary_organization_id, description, image_url, deleted_on,
    form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required)),
    services!inner( id, name )`,
  )
  .is('deleted_on', null)
  .in('id', briefIds)

  if (serviceIds && serviceIds.length > 0) {
    query = query.in('services.id', serviceIds)
  }
  try {
    const { data: briefsData, error: briefsError } = await query;

    if (briefsError)
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);
    return briefsData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchBriefs = async (
  client: SupabaseClient<Database>,
  briefIds: Brief.Type['id'][],
  columns?: (keyof Brief.Type)[]
): Promise<Brief.Response[]> => {
  try {
    // Start with the default query
    let query = client.from('briefs').select(
      'id, created_at, name, propietary_organization_id, description, image_url, deleted_on, services (name)'
    );

    // Modify the query if specific columns are provided
    if (columns && columns.length > 0) {
      query = client.from('briefs').select(columns.join(','));
    }

    // Filter by brief IDs
    query = query.in('id', briefIds)
    .is('deleted_on', null);

    const { data: briefsData, error: briefsError } = await query;
    if (briefsError) {
      throw new Error(`Error fetching the briefs: ${briefsError.message}`);
    }
    
    return briefsData as Brief.Response[]; // Ensure the return type aligns with expected output
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchBriefsByOrgOwnerId = async (
  client: SupabaseClient<Database>,
  ownerId: Brief.Type['propietary_organization_id'],
  configurations: Configurations = {},
): Promise<Brief.Relationships.Services.Response[]> => {
  try {
    // *, form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message)), services ( name )
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, image_url, deleted_on,
        form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required))
        ${configurations.includes?.includes('services') ? ',services ( id,name )' : ''}`,
      )
      .is('deleted_on', null)
      .eq('propietary_organization_id', ownerId);

    if (briefsError)
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);

    return briefsData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getBriefById = async (id: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefData, error: briefsError } = await client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, image_url, brief_form_fields 
        ( field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required)),
         services (name, id)`,
      )
      .eq('id', id)
      .single();

    if (briefsError) {
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);
    }

    return briefData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchBriefsResponsesforOrders = async (
  client: SupabaseClient<Database>,
  orderIds: Order.Type['uuid'][],
) => {
  try {
    const { data: briefResponsesData, error: briefResponsesError } =
      await client
        .from('brief_responses')
        .select('brief_id, order_id')
        .in('order_id', orderIds);

    if (briefResponsesError)
      throw new Error(
        `Error fetching the brief responses, ${briefResponsesError.message}`,
      );

    return briefResponsesData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
