import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { fetchCurrentUser } from '../../members/get/get-member-account';
import { getOrganization } from '../../organizations/get/get-organizations';


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
    console.error('Error al obtener los fields del brief', error);
    throw error;
  }
};

export const getClientBriefs = async () => {
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
    console.error('Error al obtener los briefs', error);
    throw error;
  }
};
