'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
import {
  fetchCurrentUser,
  fetchCurrentUserAccount,
  getPrimaryOwnerId,
  getUserRole,
} from '../../members/get/get-member-account';
import { fetchClientServices } from '../../services/get/get-services';

export const getBriefs = async (): Promise<
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
      const briefs = await fetchClientBriefs(client, briefIds);

      return briefs;
    }

    return [];
  } catch (error) {
    console.error('Error obtaining briefs', error);
    throw error;
  }
};

export const getBriefFormFields = async (): Promise<
  Brief.Relationships.FormField[]
> => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_form_fields')
      .select(
        'form_fields(id, description, label, type, placeholder, options, position, alert_message)',
      );

    if (errorBriefFormFields) {
      throw new Error(errorBriefFormFields.message);
    }

    return briefFormFields;
  } catch (error) {
    console.error('Error obtaining brief fields', error);
    throw error;
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
): Promise<Brief.Relationships.Services.Response[]> => {
  try {
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, image_url,
        form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message)),
        services ( name )`,
      )
      .in('id', briefIds);

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
): Promise<Brief.Response[]> => {
  try {
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        ' id, created_at, name, propietary_organization_id, description, image_url, services ( name )',
      );
    if (briefsError)
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);

    return briefsData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchBriefsByOrgOwnerId = async (
  client: SupabaseClient<Database>,
  ownerId: Brief.Type['propietary_organization_id'],
): Promise<Brief.Relationships.Services.Response[]> => {
  try {
    // *, form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message)), services ( name )
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, image_url,
        form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message)),
        services ( name )`,
      )
      .eq('propietary_organization_id', ownerId);

    if (briefsError)
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);

    return briefsData;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getBriefsById = async (
  id: string
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        `id, created_at, name, propietary_organization_id, description, image_url, brief_form_fields 
        ( field:form_fields(id, description, label, type, options, placeholder, position, alert_message)),
         services (name, id)`
      )
      .eq('id', id);

    if (briefsError) {
      throw new Error(`Error fetching the briefs, ${briefsError.message}`);
    }

    return briefsData;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

