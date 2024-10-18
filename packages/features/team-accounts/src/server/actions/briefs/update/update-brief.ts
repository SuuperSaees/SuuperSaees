'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Brief } from '../../../../../../../../apps/web/lib/brief.types';
import { FormField } from '../../../../../../../../apps/web/lib/form-field.types';
import { addFormFieldsToBriefs } from '../create/create-briefs';

export const updateBriefById = async (briefData: Brief.Type) => {
  try {
    const client = getSupabaseServerComponentClient();
    const { error } = await client
      .from('briefs')
      .update(briefData)
      .eq('id', briefData.id);

    if (error) {
      console.error('Error al crear brief:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error al crear el brief:', error);
  }
};

export const updateFormFieldsById = async (
  formFields: FormField.Type[],
  briefId: Brief.Type['id'],
) => {
  try {
    // Check if formFields is an array
    if (!Array.isArray(formFields)) {
      throw new Error('formFields is not an array');
    }

    const client = getSupabaseServerComponentClient();

    // Filter fields that have 'id'
    const fieldsWithId = formFields.filter((field) => field.id);

    if (fieldsWithId.length === 0) {
      throw new Error('No fields with valid IDs to update');
    }

    const updatePromises = fieldsWithId.map(async (field) => {
      const { id, ...rest } = field;

      // Check if 'id' is of type 'number'
      if (typeof id === 'number') {
        // Calls the addFormFieldsToBriefs function if the id is a number
        await addFormFieldsToBriefs([field], briefId);
        return null; // Do not continue with the update if addFormFieldsToBriefs was called
      }

      // If the 'id' is of type string, performs the update in the database
      const { error: formFieldError, data: formFieldData } = await client
        .from('form_fields')
        .update(rest)
        .eq('id', id)
        .select();

      if (formFieldError) {
        throw new Error(
          `Error updating form field with id ${id}: ${formFieldError.message}`,
        );
      }

      return formFieldData;
    });

    // Execute all update promises (ignoring those that called addFormFieldsToBriefs)
    const updatedFields = await Promise.all(updatePromises);

    return updatedFields.flat().filter(Boolean); // Returns only updated fields
  } catch (error) {
    console.error('Error al actualizar los fields', error);
    throw error;
  }
};
