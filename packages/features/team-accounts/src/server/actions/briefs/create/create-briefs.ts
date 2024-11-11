'use server';

// import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { FormField } from '../../../../../../../../apps/web/lib/form-field.types';
import { getOrganization } from '../../organizations/get/get-organizations';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { CustomResponse, CustomError, ErrorBriefOperations } from '../../../../../../../shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';

export const createBrief = async (clientData: Brief.Request.Create) => {
  try {

    const client = getSupabaseServerComponentClient();
    const organization = await getOrganization();
    const { data: briefData, error: briefDataError } = await client
      .from('briefs')
      .insert({
        ...clientData,
        propietary_organization_id: organization.primary_owner_user_id,
      })
      .select('id')
      .single();
    if (briefDataError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to create brief: ${briefDataError.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_BRIEF,
      );
    }

    return CustomResponse.success(briefData, 'briefCreated').toJSON();
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    return CustomResponse.error(error).toJSON();
  }
};

export const addServiceBriefs = async (
  serviceBriefs: Database['public']['Tables']['service_briefs']['Insert'][],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: serviceBriefError } = await client
      .from('service_briefs')
      .insert(serviceBriefs)
      .select();

    if (serviceBriefError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error adding services to brief: ${serviceBriefError.message}`,
        ErrorBriefOperations.FAILED_TO_CONNECT_SERVICE,
      );
    }

    // revalidatePath('/briefs');
    return CustomResponse.success(null, 'serviceConnected').toJSON();
  } catch (error) {
    console.error('Error al crear el servicio:', error);
    return CustomResponse.error(error).toJSON();  
  }
};

export const createFormFields = async (formFields: FormField.Insert[]) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Create a new list of formFields without the 'id' field
    const formFieldsWithoutId = formFields.map(({ id: _id, ...rest }) => rest);
    const { error: formFieldError, data: formFieldData } = await client
      .from('form_fields')
      .insert(formFieldsWithoutId)
      .select();

    if (formFieldError) {
      throw new Error(formFieldError.message);
    }

    return formFieldData;

    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al crear el field', error);
    throw error;
  }
};


// link form fields to briefs
export const addFormFieldsToBriefs = async (
  formFields: FormField.Insert[],
  briefId: Brief.Type['id'],
) => {
  try {
    const formFieldData = await createFormFields(formFields);
    const briefFormFields = formFieldData?.map((field) => ({
      brief_id: briefId,
      form_field_id: field.id,
    }));

    const client = getSupabaseServerComponentClient();
    // create the relation ('brief_form_fields')
    const { error: briefFormFieldError } = await client
      .from('brief_form_fields')
      .insert(briefFormFields);

    if (briefFormFieldError) {
      throw new Error(briefFormFieldError.message);
    }
    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al añadir los fields al brief', error);
    throw error;
  }
};

// create and link the responses to the brief form fields "brief_responses"
export const addResponsesToBriefFormField = async (
  responses: Brief.Relationships.FormFieldResponses,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: briefResponseError } = await client
      .from('brief_responses')
      .insert(responses);

    if (briefResponseError) {
      throw new Error(briefResponseError.message);
    }

    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al añadir las respuestas al brief', error);
    throw error;
  }
};
