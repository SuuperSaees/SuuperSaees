import { CustomError, JSONCustomError } from './errors';
import { HttpStatus } from './http-status';
import { CustomSuccess, JSONCustomSuccess } from './success/custom-success';

/**
 * Represents a response in the application. Contains either an error or a success result.
 *
 * @property {CustomError | null} error - The error returned in the response, if any. Defaults to null.
 * @property {CustomSuccess<T> | null} success - The data returned in the response, if any. Defaults to null.
 * @property {boolean} ok - Whether the response is successful (200 - 299 status codes) or not.
 */

export type JSONCustomResponse<T = null> = {
  error: JSONCustomError | null;
  success: JSONCustomSuccess<T> | null;
  ok: boolean;
};

export class CustomResponse<T = unknown> {
  error: JSONCustomError | null;
  success: JSONCustomSuccess<T> | null;
  ok: boolean;

  constructor(
    error: JSONCustomError | null = null,
    success: JSONCustomSuccess<T> | null = null,
  ) {
    // Check for conflicting states
    if (error !== null && success !== null) {
      throw new Error('Both error and success cannot be set at the same time.');
    }
    this.error = error;
    this.success = success;
    // The `ok` flag is true if there's no error and there is a success object
    this.ok = error === null && success !== null;
  }

  // Static method to create an error response
  static error(error: unknown, operationName?: string): CustomResponse<null> {
    const newError = CustomError.fromUnknown(error, operationName);
    if (
      newError.status < (400 as HttpStatus.Error) ||
      newError.status > (599 as HttpStatus.Error)
    ) {
      throw new Error('Error status code must be between 400 and 599.');
    }
    return new CustomResponse<null>(newError, null);
  }

  // Static method to create a success response
  static success<T>(success: T, operationName?: string): CustomResponse<T> {
    const newSuccess = CustomSuccess.fromUnknown(success, operationName);
    if (
      newSuccess.status < (200 as HttpStatus.Success) ||
      newSuccess.status > (299 as HttpStatus.Success)
    ) {
      throw new Error('Success status code must be between 200 and 299.');
    }
    return new CustomResponse<T>(null, newSuccess);
  }

  toJSON(): JSONCustomResponse<T> {
    return {
      error: this.error
        ? {
            status: this.error.status,
            message: this.error.message,
            operationName: this.error.operationName,
            data: this.error.data,
            statusText: this.error.statusText,
          }
        : null,
      success: this.success
        ? {
            status: this.success.status,
            message: this.success.message,
            operationName: this.success.operationName,
            data: this.success.data,
            statusText: this.success.statusText,
          }
        : null,
      ok: this.ok,
    };
  }

  static fromUnknown<T>(result: T): CustomResponse<T> {
    return convertToCustomResponse(result);
  }
}

// Helper function to serialize response be either an error or a success
export const serializeResponse = <T>(
  response: CustomResponse<T>,
): CustomResponse<T> => {
  return JSON.parse(JSON.stringify(response)) as CustomResponse<T>;
};

// Function to convert unknown data to CustomResponse
// if the result is an error, it will be converted to CustomError
// if the result is a success, it will be converted to CustomSuccess
// if the result is neither, it will be converted to CustomResponse with null error and success
export const convertToCustomResponse = <T>(result: T): CustomResponse<T> => {
  if (result instanceof CustomError) {
    return new CustomResponse<T>(result as CustomError, null);
  } else if (result instanceof CustomSuccess) {
    return new CustomResponse<T>(null, result as CustomSuccess<T>);
  } else {
    return new CustomResponse<T>(null, null);
  }
};
