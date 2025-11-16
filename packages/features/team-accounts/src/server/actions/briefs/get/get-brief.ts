'use server';

import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import {
  QueryBuilder,
  QueryConfigurations,
} from '../../../../../../../../apps/web/app/server/actions/query.config';
import { transformToPaginatedResponse } from '../../../../../../../../apps/web/app/server/actions/utils/response-transformers';
import {
  Brief,
  BriefResponse,
} from '../../../../../../../../apps/web/lib/brief.types';
import { Order } from '../../../../../../../../apps/web/lib/order.types';
import { Pagination } from '../../../../../../../../apps/web/lib/pagination';
import { Service } from '../../../../../../../../apps/web/lib/services.types';
// Removed unused imports - RLS policies handle access control automatically

interface Configurations {
  includes?: Array<string>;
}

export const getBriefs = async (
  configurations?: QueryConfigurations<Brief.Relationships.Services.Response>,
): Promise<Pagination.Response<Brief.Relationships.Services.Response>> => {
  try {
    const client = getSupabaseServerComponentClient<Database>();

    // RLS policies handle all the access control automatically
    const query = client
      .from('briefs')
      .select(
        'id, created_at, name, propietary_organization_id, description, image_url, deleted_on, form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required))' +
          (configurations?.includes?.includes('services')
            ? ', services(id, name)'
            : ''),
        {
          count: configurations?.pagination ? 'exact' : undefined,
        },
      )
      .is('deleted_on', null)
      .order('created_at', { ascending: false });

    // Apply pagination only if configurations and pagination are provided
    if (configurations?.pagination) {
      const paginatedBriefs = QueryBuilder.getInstance().enhance(
        query,
        configurations,
      );
      const response = await paginatedBriefs;
      
      if (response.error) {
        throw new Error(`Error fetching briefs: ${response.error.message}`);
      }
      
      return transformToPaginatedResponse<Brief.Relationships.Services.Response>(
        response,
        configurations.pagination,
      );
    } else {
      // No pagination - get all results
      const { data, error } = await query;
      
      if (error) {
        throw new Error(`Error fetching briefs: ${error.message}`);
      }

      return data as unknown as Brief.Relationships.Services.Response[];
    }
    //asd
  } catch (error) {
    console.error('Error obtaining briefs', error);
    throw error;
  }
};

export const fetchFormfieldsWithResponses = async (
  orderId: Order.Type['uuid'],
): Promise<BriefResponse.Response[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_responses')
      .select(
        `id, created_at, response,
        field:form_fields(*),
        brief:briefs(id, name)
        `,
      )
      .eq('order_id', orderId);

    if (errorBriefFormFields) {
      throw new Error(
        `Failed to get brief responses for order (${orderId}), ${errorBriefFormFields.message}`,
      );
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
    .in('id', briefIds);

  if (serviceIds && serviceIds.length > 0) {
    query = query.in('services.id', serviceIds);
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
  columns?: (keyof Brief.Type)[],
): Promise<Brief.Response[]> => {
  try {
    // Start with the default query
    let query = client
      .from('briefs')
      .select(
        'id, created_at, name, propietary_organization_id, description, image_url, deleted_on, services (name)',
      );

    // Modify the query if specific columns are provided
    if (columns && columns.length > 0) {
      query = client.from('briefs').select(columns.join(','));
    }

    // Filter by brief IDs
    query = query.in('id', briefIds).is('deleted_on', null);

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
    const { data: briefsData, error: briefsError } = await client
      .from('briefs')
      .select(
        'id, created_at, name, propietary_organization_id, description, image_url, deleted_on, form_fields:brief_form_fields(field:form_fields(id, description, label, type, options, placeholder, position, alert_message, required))' +
          (configurations.includes?.includes('services')
            ? ', services(id, name)'
            : ''),
      )
      .is('deleted_on', null)
      .eq('propietary_organization_id', ownerId)
      .order('created_at', { ascending: false });

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
