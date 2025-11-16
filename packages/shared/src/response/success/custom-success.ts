import { HttpStatus, statusCodeMap } from '../http-status';

/**
 * Represents an success response in the application.
 *
 * @property {HttpStatus} status - HTTP status code.
 * @property {string} statusText - Description of the status (e.g., "OK").
 * @property {string} [message] - Optional message providing more details about the success.
 * @property {T | null} [data] - Data returned in a successful response. * which can be either an object or an array. Defaults to null.
 */
export type JSONCustomSuccess<T> = Omit<CustomSuccess<T>, 'toJSON'>;

export class CustomSuccess<T = unknown> {
  status: HttpStatus.Success;
  operationName?: string;
  message?: string;
  data?: T | null;
  statusText?: string;

  constructor(
    status: HttpStatus.Success,
    operationName?: string,
    message?: string,
    statusText?: string,
    data?: T | null,
  ) {
    this.status = status;
    this.statusText = statusText ?? statusCodeMap[status] ?? 'Success';
    this.message = message;
    this.data = data;
    this.operationName = operationName;
  }

  toJSON(): JSONCustomSuccess<T> {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
      statusText: this.statusText,
      operationName: this.operationName,
    };
  }

  static fromUnknown<T>(result: T, operationName?: string): CustomSuccess<T> {
    return convertToCustomSuccess(result, operationName);
  }
}

// Helper function to serialize success while inferring the type of the data
export const serializeSuccess = <T>(
  success: CustomSuccess<T>,
): CustomSuccess<T> => {
  return JSON.parse(JSON.stringify(success)) as CustomSuccess<T>;
};

// Function to convert unknown data to CustomSuccess
export const convertToCustomSuccess = <T>(
  result: T,
  operationName?: string,
): CustomSuccess<T> => {
  
  if (result instanceof CustomSuccess) {
    return operationName
      ? (new CustomSuccess(
          result.status,
          operationName,
          result.message,
          result.statusText,
          result?.data ?? null,
        ) as CustomSuccess<T>)
      : (result as CustomSuccess<T>);
  } else {
    return new CustomSuccess(
      200,
      operationName,
      'Success!',
      statusCodeMap[200],
      result,
    );
  }
};
