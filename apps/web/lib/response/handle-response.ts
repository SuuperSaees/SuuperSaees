import { toast } from 'sonner';

import { CustomError, CustomSuccess } from '@kit/shared/response';

import { TFunction } from '../../../../node_modules/.pnpm/i18next@23.12.2/node_modules/i18next/index';
import { Entity } from '../entity.types';
import {
  isCustomError,
  isCustomResponse,
  isCustomSuccess,
} from './is-custom-response';

interface ResponseConfiguration {
  showSuccessToast?: boolean
  showErrorToast?: boolean
}

/**
 * Handles the response based on whether it contains an error or success object,
 * triggering the appropriate notification.
 *
 * @param response - The response object to evaluate.
 * @param entity - The entity type (e.g., 'clients', 'accounts') for message translations.
 * @param t - Translation function for localization.
 */
export function handleResponse<T>(
  response: T,
  entity: Entity,
  t: TFunction,
  configuration: ResponseConfiguration = { showSuccessToast: true, showErrorToast: true }
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (isCustomResponse(response)) {
      if (response.error && isCustomError(response.error)) {
        handleNotification(response.error, 'error', entity, t, configuration);
        reject(response.error); // Reject the promise on error
      } else if (response.success && isCustomSuccess(response.success)) {
        handleNotification(response.success, 'success', entity, t, configuration);
        resolve(response.success as T); // Resolve the promise on success
      } else {
        reject(new Error('Unexpected response format')); // Reject for any other case
      }
    } else {
      reject(new Error('Invalid response')); // Reject if not a custom response
    }
  });
}

/**
 * Generates and displays a toast notification based on the result type (error or success).
 *
 * @param result - The result object, which can be either CustomError or CustomSuccess.
 * @param type - Specifies if the result is an 'error' or 'success' for notification styling.
 * @param entity - The entity type for constructing the translation key.
 * @param t - Translation function to retrieve localized messages.
 */
function handleNotification(
  result: CustomError | CustomSuccess,
  type: 'error' | 'success',
  entity: Entity,
  t: TFunction,
  configuration?: ResponseConfiguration
) {
  const operationName = extractOperationName(result);
  const description =
    operationName === 'default'
      ? t(`${type}.default`)
      : t(`${type}.${entity}.${operationName}`);
  // const statusText = result.statusText;
  
  // Display notification using the appropriate toast method (error or success)
  if(type === 'success' && configuration?.showSuccessToast){
    toast[type](t('common:success'), { description });
  }else if(type === 'error' && configuration?.showErrorToast){
    toast[type](t('common:error'), { description });
  }
}

/**
 * Extracts the operation name from the result's data, if available.
 * Defaults to 'default' if operation name is not specified.
 *
 * @param result - The result object, either CustomError or CustomSuccess.
 * @returns The operation name or 'default' if not found.
 */
function extractOperationName(result: CustomError | CustomSuccess): string {
  if ('operationName' in result && result.operationName) {
    return result.operationName;
  }
  return 'default';
}
