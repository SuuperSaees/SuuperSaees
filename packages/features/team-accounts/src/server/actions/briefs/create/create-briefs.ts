'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { FormField } from '../../../../../../../../apps/web/lib/form-field.types';
import { getOrganization } from '../../organizations/get/get-organizations';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { CustomResponse, CustomError, ErrorBriefOperations } from '../../../../../../../shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { revalidatePath } from 'next/cache';

export const createBrief = async (clientData: Brief.Request.Create) => {
  try {
    // Create a draft brief
    const client = getSupabaseServerComponentClient();
    const organization = await getOrganization();

    // Step 1: Get the the briefs to get the number of the last brief ("number" property)
    const { data: briefsData, error: briefsDataError } = await client
      .from('briefs')
      .select('number')
      .order('number', { ascending: false })
      .eq('propietary_organization_id', organization.owner_id ?? '')
   
    const lastBrief = briefsData?.[0] ;

    if (briefsDataError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error getting briefs: ${briefsDataError.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_BRIEF,
      );
    }

    // Step 2: Create the brief with isDraft: true and name the number of the briefs and as name the number of the briefs
    const briefDraftNumber = (lastBrief?.number ?? 0 ) + 1;
    const { data: briefData, error: briefDataError } = await client
      .from('briefs')
      .insert({
        ...clientData,
        name: `Draft #${briefDraftNumber}`,
        propietary_organization_id: organization.owner_id ?? '',
        isDraft: true,
        number: briefDraftNumber,
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
    revalidatePath(`/briefs/${briefData.id}`);
    return CustomResponse.success(briefData, 'briefCreated').toJSON();
  } catch (error) {
    console.error('Error creating the brief:', error);
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

const normalizeSelectOptions = (formFields: FormField.Insert[]): FormField.Insert[] => {
  return formFields.map(field => {
    if ((field.type === 'select' || field.type === 'multiple_choice' || field.type === 'dropdown')  && field.options) {
      return {
        ...field,
        options: field.options.map(option => ({
          label: option?.label ?? '',
          value: option?.label ?? ''
        }))
      };
    }
    return field;
  });
};

export const createFormFields = async (formFields: FormField.Insert[]): Promise<FormField.Type[]> => {
  try {
    const client = getSupabaseServerComponentClient();
    const modifiedFormFields = normalizeSelectOptions(formFields);

    const formFieldsWithoutId = modifiedFormFields.map(({ id: _id, ...rest }) => rest);
    const { data: formFieldData, error: formFieldError } = await client
      .from('form_fields')
      .insert(formFieldsWithoutId)
      .select();

    if (formFieldError) throw new Error(formFieldError.message);
    return formFieldData as FormField.Type[];

  } catch (error) {
    console.error('Error creating field:', error);
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
    console.error('Error adding fields to the brief:', error);
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

export const duplicateBrief = async (briefId: string) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Get the original brief with its relationships
    const { data: originalBrief, error: briefError } = await client
      .from('briefs')
      .select(`
        *,
        services:service_briefs(service_id),
        form_fields:brief_form_fields(
          form_field:form_fields(*)
        )
      `)
      .eq('id', briefId)
      .single();

    if (briefError ?? !originalBrief) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error getting original brief: ${briefError?.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_BRIEF,
      );
    }

    // Get the last brief number
    const { data: briefsData, error: briefsDataError } = await client
      .from('briefs')
      .select('number')
      .order('number', { ascending: false })
      .limit(1)
      .eq('propietary_organization_id', originalBrief.propietary_organization_id);

    if (briefsDataError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error getting briefs: ${briefsDataError.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_BRIEF,
      );
    }

    const lastBriefNumber = briefsData?.[0]?.number ?? 0;

    // Create the new brief
    const { data: newBrief, error: newBriefError } = await client
      .from('briefs')
      .insert({
        name: `${originalBrief.name} (Copy)`,
        description: originalBrief.description,
        image_url: originalBrief.image_url,
        propietary_organization_id: originalBrief.propietary_organization_id,
        number: lastBriefNumber + 1,
        isDraft: originalBrief.isDraft,
      })
      .select()
      .single();

    if (newBriefError ?? !newBrief) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Failed to create duplicate brief: ${newBriefError?.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_BRIEF,
      );
    }

    // Duplicate service connections
    if (originalBrief.services && originalBrief.services.length > 0) {
      const serviceBriefs = originalBrief.services.map((service) => ({
        brief_id: newBrief.id,
        service_id: service.service_id,
      }));

      await addServiceBriefs(serviceBriefs);
    }

    // Duplicate form fields
    if (originalBrief.form_fields && originalBrief.form_fields.length > 0) {
      const formFields = originalBrief.form_fields.map(
        ({ form_field }) => form_field,
      );
      await addFormFieldsToBriefs(formFields, newBrief.id);
    }

    revalidatePath('/briefs');
    return CustomResponse.success(newBrief, 'briefDuplicated').toJSON();
  } catch (error) {
    console.error('Error duplicating brief:', error);
    return CustomResponse.error(error).toJSON();
  }
};
