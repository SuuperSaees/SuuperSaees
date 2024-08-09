import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

export const getBriefFormFields = async () => {
  try {
    const client = getSupabaseServerComponentClient();
    const { data: briefFormFields, error: errorBriefFormFields } = await client
      .from('brief_form_fields')
      .select(
        'form_fields (id, description, label, type, placeholder, options)',
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
