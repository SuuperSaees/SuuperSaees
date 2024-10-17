import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import {
  fetchCurrentUser,
  getPrimaryOwnerId,
} from '../../members/get/get-member-account';
import { getOrganization } from '../../organizations/get/get-organizations';

export const fetchBriefs = async (client: SupabaseClient<Database>) => {
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
) => {
  try {
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        ' id, created_at, name, propietary_organization_id, description, image_url, services ( name )',
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

export const getBriefs =
  async (): Promise<Brief.Relationships.Services.Response[]> => {
    try {
      const client = getSupabaseServerComponentClient<Database>();

      // Step 1: verify the user is authenticated
      await fetchCurrentUser(client);

      // Step 2: get the propitary_organization_id
      const organizationOwnerId = await getPrimaryOwnerId();

      // Step 3: get the briefs
      const briefs = await fetchBriefsByOrgOwnerId(
        client,
        organizationOwnerId ?? '',
      );

      return briefs;
    } catch (error) {
      console.error('Error obtaining briefs', error);
      throw error;
    }
  };

export const getBriefFormFields = async () => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_form_fields')
      .select(
        'form_fields(id, description, label, type, placeholder, options)',
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

export const getClientBriefs = async (): Promise<Brief.Relationships.FormField[]> => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: verify the user is authenticated
    await fetchCurrentUser(client);

    const organization = await getOrganization();
    const organizationId = organization?.id;

    if (!organizationId) throw new Error('Organization not found');

    // Step 2: get the attached services to the client
    const { data: clientServices, error: errorClientService } = await client
      .from('client_services')
      .select('service_id')
      .eq('client_organization_id', organizationId);

    if (errorClientService)
      throw new Error(
        `Error getting the client services, ${errorClientService.message}`,
      );

    const serviceIds = clientServices?.map((service) => service.service_id);

    // Step 3: found the related briefs to the client service
    const { data: serviceBriefs, error: errorServiceBriefs } = await client
      .from('service_briefs')
      .select('brief_id')
      .in('service_id', serviceIds);

    if (errorServiceBriefs)
      throw new Error(
        `Error getting the service briefs, ${errorServiceBriefs.message}`,
      );

    const briefIds = serviceBriefs?.map((brief) => brief.brief_id);

    const { data: briefs, error: errorBriefs } = await client
      .from('briefs')
      .select(
        '*, form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message))',
      )
      .in('id', briefIds);

    if (errorBriefs) {
      throw new Error(errorBriefs.message);
    }

    return briefs;
  } catch (error) {
    console.error('Error obtaining briefs', error);
    throw error;
  }
};


export const getBriefFormFieldsById = async ( id: string) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_form_fields')
      .select(
        'form_fields(id, description, label, type, placeholder, options)',
      )
      .eq('brief_id', id);

    if (errorBriefFormFields) {
      throw new Error(errorBriefFormFields.message);
    }

    return briefFormFields;
  } catch (error) {
    console.error('Error obtaining brief fields', error);
    throw error;
  }
};

