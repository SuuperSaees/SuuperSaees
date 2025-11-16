'use server';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';



import { Database } from '../../../../../../../../apps/web/lib/database.types';
import { CustomResponse, ErrorOrganizationOperations } from '../../../../../../../../packages/shared/src/response';
import { CustomError } from '../../../../../../../../packages/shared/src/response';
import { HttpStatus } from '../../../../../../../shared/src/response/http-status';
import { hasPermissionToViewOrganization } from '../../permissions/organization';
import { revalidatePath } from 'next/cache';


// Hex color validation regex
const isValidHexColor = (color: string) => /^#([0-9A-F]{3}){1,2}$/i.test(color);

export const upsertOrganizationSettings = async (
  organizationSetting: Omit<
    Database['public']['Tables']['organization_settings']['Insert'],
    'organization_id'
  >,
) => {
  const client = getSupabaseServerComponentClient();

  try {
    // Fetch the organization account for the current user
   const organizationId = (await client.rpc('get_current_organization_id')).data ?? '';

    // Validate hex color if key is 'theme_color'
    if (
      organizationSetting.key === 'theme_color' &&
      organizationSetting.value !== '' && // Allow empty string
      !isValidHexColor(organizationSetting.value)
    ) {
     throw new CustomError(
        HttpStatus.Error.BadRequest,
        'Invalid theme color, hex code expected',
        ErrorOrganizationOperations.FAILED_TO_UPDATE_ORGANIZATION_SETTINGS_COLOR,
      );
    }

    // Check if the setting already exists
    const { data: existingSetting, error: fetchError } = await client
      .from('organization_settings')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('key', organizationSetting.key)
      .maybeSingle();

    if (fetchError && fetchError.details !== 'No rows returned') {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error fetching organization settings: ${fetchError.message}`,
        ErrorOrganizationOperations.FAILED_TO_GET_ORGANIZATION_SETTINGS,
      );
    }

    if (existingSetting) {
      // If the setting exists, update it
      const { data: updatedSetting, error: updateError } = await client
        .from('organization_settings')
        .update({ value: organizationSetting.value })
        .eq('organization_id', organizationId)
        .eq('key', organizationSetting.key)
        .select()
        .maybeSingle(); // Expecting a single result or no result

      if (updateError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error updating organization settings: ${updateError.message}`,
          ErrorOrganizationOperations.FAILED_TO_UPDATE_ORGANIZATION_SETTING,
        );
      }

      revalidatePath('/home', 'layout');

      return CustomResponse.success(updatedSetting, 'organizationSettingUpdated').toJSON();
    } else {
      // If the setting does not exist, insert it
      const newSetting = {
        organization_id: organizationId ?? '',
        key: organizationSetting.key,
        value: organizationSetting.value,
      };

      const { data: insertedSetting, error: insertError } = await client
        .from('organization_settings')
        .insert(newSetting)
        .select()
        .maybeSingle(); // Expecting a single result or no result

      if (insertError) {
        throw new CustomError(
          HttpStatus.Error.InternalServerError,
          `Error inserting organization settings: ${insertError.message}`,
          ErrorOrganizationOperations.FAILED_TO_CREATE_ORGANIZATION_SETTING,
        );
      }
      
      revalidatePath('/home', 'layout');
      return CustomResponse.success(insertedSetting, 'organizationSettingCreated').toJSON();
    }
  } catch (error) {
    console.error('Error while updating the organization settings', error);
    return CustomResponse.error(error).toJSON();
  }
};

export const updateOrganization = async (
  id: string,
  data: { name?: string, picture_url?: string },
) => {
  const client = getSupabaseServerComponentClient();

  try {
    const hasPermission = await hasPermissionToViewOrganization(id);
    if (!hasPermission) {
      throw new Error('User not authorized');
    }

    const { data: updatedOrganizationData, error: updatedOrganizationError } =
      await client
        .from('organizations')
        .update(data)
        .eq('id', id)
        .select()
        .maybeSingle(); // Expecting a single result or no result

    if (updatedOrganizationError) {
      throw new CustomError(
        HttpStatus.Error.InternalServerError,
        `Error updating organization ${id}`,
        ErrorOrganizationOperations.FAILED_TO_UPDATE_ORGANIZATION,
      );
    }

    return CustomResponse.success(updatedOrganizationData, 'organizationUpdated').toJSON();
  } catch (error) {
    console.error('Error updating organization:', error);
    return CustomResponse.error(error).toJSON();
  }
};