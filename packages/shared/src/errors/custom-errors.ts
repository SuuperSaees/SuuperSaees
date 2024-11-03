import { HttpStatus, statusCodeMap } from './http-status';

/**
 * Represents an error in the application.
 * 
 * @property {number} code - HTTP status code.
 * @property {string} status - Description of the status (e.g., "Not Found").
 * @property {string} [message] - Optional message providing more details about the error.
 * @property {Record<string, unknown> | Array<unknown>} [data] - Additional information about the error, 
 * which can be either an object or an array.
 */
export class CustomError extends Error {
  status: HttpStatus;
  message: string;
  statusText?: string;
  data?: Record<string, unknown> | Array<unknown>;

  constructor(
    status: HttpStatus,
    message: string,
    statusText?: string,
    data?: Record<string, unknown> | Array<unknown>,
  ) {
    super(message);
    this.status = status;
    this.statusText = statusText ?? statusCodeMap[status];
    this.message = message;
    this.data = data;
  }
}

// Helper function to serialize errors
export const serializeError = (error: Error | CustomError) => {
  return JSON.parse(JSON.stringify(error)) as CustomError;
};

// Function to handle errors
export const handleError = (error: unknown): CustomError => {
  if (error instanceof CustomError) {
    return serializeError(error);
  } else if (error instanceof Error) {
    return serializeError(new CustomError(404, error.message));
  } else {
    return serializeError(
      new CustomError(500, statusCodeMap[500], 'An error has occurred'),
    );
  }
};