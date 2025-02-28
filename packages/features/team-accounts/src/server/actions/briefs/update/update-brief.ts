'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { FormField } from '../../../../../../../../apps/web/lib/form-field.types';
import {
  CustomError,
  CustomResponse,
  ErrorBriefOperations,
} from '../../../../../../../shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import {  createFormFields } from '../create/create-briefs';
import { revalidatePath } from 'next/cache';

export const updateBriefById = async (briefData: Brief.Request.Update) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('briefs')
      .update({
        ...briefData,
        isDraft: false,
      })
      .eq('id', briefData.id);

    if (error) {
      console.error('Error al crear brief:', error);
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error updating brief: ${error.message}`,
        ErrorBriefOperations.FAILED_TO_UPDATE_BRIEF,
      );
    }
    revalidatePath(`/briefs/${briefData.id}`);
    return CustomResponse.success(briefData, 'briefUpdated').toJSON();
  } catch (error) {
    console.error('Error al crear el brief:', error);
    return CustomResponse.error(error).toJSON();
  }
};

export const updateFormFieldsById = async (
  formFields: FormField.Update[],
  briefId: Brief.Type['id'],
) => {
  try {
    const client = getSupabaseServerComponentClient();
    // Fetch existing fields for the brief
    const { data: existingFields, error: fetchError } = await client
      .from('brief_form_fields')
      .select('id:form_field_id')
      .eq('brief_id', briefId)
      
    if (fetchError) {
      console.error('Error fetching existing form fields:', fetchError);
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error fetching existing form fields: ${fetchError.message}`,
        ErrorBriefOperations.FAILED_TO_GET_FORM_FIELDS,
      );
    }

    // Identify fields to update and create
    const fieldsToUpdate = formFields.filter((field) => field.id);
    const fieldsToCreate = formFields.filter(
      (field): field is FormField.Insert =>
        !field.id &&
        field.label !== undefined &&
        field.position !== undefined &&
        typeof field.label === 'string' &&
        typeof field.position === 'number'
    );

    // Identify fields to delete
    const existingFieldIds = existingFields.map((field) => field.id);
    const updatedFieldIds = fieldsToUpdate.map((field) => field.id);
    const fieldsToDelete = existingFieldIds.filter(
      (id) => !updatedFieldIds.includes(id)
    );

    // Perform deletion if there are fields to remove
    if (fieldsToDelete.length > 0) {
      const { error: deleteError } = await client
        .from('form_fields')
        .delete()
        .in('id', fieldsToDelete);

      if (deleteError) {
        console.error('Error deleting form fields:', deleteError);
        throw new CustomError(
          HttpStatus.Error.BadRequest,
          `Error deleting form fields: ${deleteError.message}`,
          ErrorBriefOperations.FAILED_TO_DELETE_FORM_FIELDS,
        );
      }
    }

    // Perform bulk updates for fields with an id
    const updatePromises = fieldsToUpdate.map(({ id, ...field }) =>
      client.from('form_fields').update(field).eq('id', id ?? '')
    );

    // Execute update queries in parallel
    const updateResults = await Promise.all(updatePromises).catch((error) => {
      console.error('Error updating form fields:', error);
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error updating form fields: ${error.message}`,
        ErrorBriefOperations.FAILED_TO_UPDATE_FIELDS,
      );
    });

    // Collect updated fields
    const updatedFields = updateResults
      .map(({ data }) => data)
      .filter((field) => field !== null)
      .flat();

    // If there are fields to create, use your separate insert function
    let createdFields: FormField.Insert[] = [];
    if (fieldsToCreate.length > 0) {
      createdFields = await createFormFields(fieldsToCreate); // Call your separate insert function
    }

    // Combine updated and newly created fields
    const allFields = [...updatedFields, ...createdFields];

    // Associate the updated and newly created fields with the brief
    const briefFormFields = allFields.map((field) => ({
      brief_id: briefId,
      form_field_id: field.id ?? '',
    }));

    const { error: briefFormFieldError } = await client
    .from('brief_form_fields')
    .insert(briefFormFields);
    
    if (briefFormFieldError) {
      throw new CustomError(
        HttpStatus.Error.BadRequest,
        `Error associating fields to brief: ${briefFormFieldError.message}`,
        ErrorBriefOperations.FAILED_TO_CREATE_FORM_FIELDS,
      );
    }
    return CustomResponse.success(allFields, 'fieldsUpdated').toJSON();
  } catch (error) {
    console.error('Error while updating/creating fields', error);
    return CustomResponse.error(error).toJSON();
  }
};

// Supabase function to update service briefs
export const updateServiceBriefs = async (
  briefId: string,
  updatedServices: Database['public']['Tables']['service_briefs']['Update'][],
) => {
  try {
    const client = getSupabaseServerComponentClient();

    // Step 1: Fetch current service briefs associated with the brief
    const { data: existingServiceBriefs, error: fetchError } = await client
      .from('service_briefs')
      .select('service_id')
      .eq('brief_id', briefId);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const existingServiceIds =
      existingServiceBriefs?.map((brief) => brief.service_id) || [];

    const updatedServiceIds = updatedServices.map(
      (service) => service.service_id,
    );

    // Step 2: Identify services to remove (those not in updated list)
    const servicesToRemove = existingServiceIds.filter(
      (id) => !updatedServiceIds.includes(id),
    );

    // Step 3: Upsert updated services
    if (updatedServices.length > 0) {
      const { error: upsertError } = await client
        .from('service_briefs')
        .upsert(updatedServices);

      if (upsertError) {
        throw new Error(upsertError.message);
      }
    }

    // Step 4: Remove services no longer connected
    if (servicesToRemove.length > 0) {
      const { error: deleteError } = await client
        .from('service_briefs')
        .delete()
        .eq('brief_id', briefId)
        .in('service_id', servicesToRemove);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    }
  } catch (error) {
    console.error('Error updating service briefs:', error);
  }
};
