import { HttpStatus, statusCodeMap } from '../http-status';

/**
 * Represents an error response in the application.
 *
 * @property {number} code - HTTP status code.
 * @property {string} status - Description of the status (e.g., "Not Found").
 * @property {string} [message] - Optional message providing more details about the error.
 * @property {Record<string, unknown> | Array<unknown>} [data] - Additional information about the error,
 * which can be either an object or an array.
 */
export type JSONCustomError = Omit<CustomError, 'toJSON' | 'stack' | 'name'>;

export class CustomError extends Error {
  status: HttpStatus.Error;
  message: string;
  operationName?: string;
  data?: Record<string, unknown> | Array<unknown> | null;
  statusText?: string;

  constructor(
    status: HttpStatus.Error,
    message: string,
    operationName?: string,
    statusText?: string,
    data?: Record<string, unknown> | Array<unknown> | null,
  ) {
    super(message);
    this.status = status;
    this.statusText = statusText ?? statusCodeMap[status] ?? 'Unknown Error';
    this.message = message;
    this.data = data ?? null;
    this.operationName = operationName;
  }

  // Method to serialize the error instance
  toJSON(): JSONCustomError {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
      statusText: this.statusText,
      operationName: this.operationName,
    };
  }

  // Static method to create a CustomError from an unknown error
  static fromUnknown(error: unknown, operationName?: string): CustomError {
    return convertToCustomError(error, operationName);
  }
}

// Helper function to serialize errors
export const serializeError = (error: Error | CustomError) => {
  return JSON.parse(JSON.stringify(error)) as CustomError;
};

// Function to convert error in CustomError instances
export const convertToCustomError = (error: unknown, operationName?: string): CustomError => {
  if (error instanceof CustomError) {
    return operationName ? new CustomError(error.status, error.message, operationName, error.statusText, error.data) : error;
  } else if (error instanceof Error) {
    return new CustomError(400, error.message);
  } else {
    return new CustomError(
      500,
      'An error has occurred',
      undefined,
      statusCodeMap[500],
    );
  }
};
