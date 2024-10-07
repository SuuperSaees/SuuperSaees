'use server';

// import { revalidatePath } from 'next/cache';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { FormField } from '../../../../../../../../apps/web/lib/form-field.types';

// Define la función createClient
export const createBrief = async (clientData: Brief.Insert) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefData, error: briefDataError } = await client
      .from('briefs')
      .insert(clientData)
      .select('id')
      .single();
    if (briefDataError) {
      throw new Error(briefDataError.message);
    }

    return briefData;
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};

export const addServiceBriefs = async (
  serviceBriefs: Brief.Relationships.Service,
) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: serviceBriefError } = await client
      .from('service_briefs')
      .insert(serviceBriefs)
      .select();

    if (serviceBriefError) {
      throw new Error(serviceBriefError.message);
    }

    // revalidatePath('/briefs');
  } catch (error) {
    console.error('Error al crear el servicio:', error);
  }
};

// insert form fields
export const createFormFields = async (formFields: FormField.Type[]) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error: formFieldError, data: formFieldData } = await client
      .from('form_fields')
      .insert(formFields)
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
