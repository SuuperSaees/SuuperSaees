import {
  ErrorAnnotationOperations,
  ErrorBillingOperations,
  ErrorBriefOperations,
  ErrorClientOperations,
  ErrorOrderOperations,
  ErrorOrganizationOperations,
  ErrorServiceOperations,
  ErrorUserOperations,
} from '@kit/shared/response';
import { HttpStatus, statusCodeMap } from '@kit/shared/response';

export type ApiErrorResponse = {
  // Please, verify if you need create a BaseResponse Class
  status: HttpStatus.Error;
  message: string;
  operationName?: string;
  data?: Record<string, unknown> | Array<unknown> | null;
  statusText?: string;
};

export class ApiError extends Error {
  statusText: string;
  constructor(
    public readonly status: HttpStatus.Error,
    message: string,
    public readonly operationName?: string,
    public readonly data?: Record<string, unknown> | Array<unknown> | null,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusText = statusCodeMap[status];
  }

  /**
   * Client Errors
   */
  static notFound(
    message: string,
    operationName:
      | ErrorClientOperations
      | ErrorUserOperations
      | ErrorBillingOperations
      | ErrorOrganizationOperations
      | ErrorBriefOperations
      | ErrorOrderOperations
      | ErrorServiceOperations
      | ErrorAnnotationOperations,
  ) {
    return new ApiError(HttpStatus.Error.NotFound, message, operationName);
  }

  static badRequest(
    message: string,
    operationName?: string,
    data?: Record<string, unknown>,
  ) {
    return new ApiError(
      HttpStatus.Error.BadRequest,
      message,
      operationName,
      data,
    );
  }

  static unauthorized(operationName?: string) {
    return new ApiError(
      HttpStatus.Error.Unauthorized,
      'Unauthorized',
      operationName,
    );
  }

  static forbidden(operationName?: string) {
    return new ApiError(
      HttpStatus.Error.Forbidden,
      'Insufficient permissions',
      operationName ?? ErrorClientOperations.INSUFFICIENT_PERMISSIONS,
    );
  }

  /**
   * Business Errors
   */
  static conflict(
    message: string,
    operationName: string,
    data?: Record<string, unknown>,
  ) {
    return new ApiError(
      HttpStatus.Error.Conflict,
      message,
      operationName,
      data,
    );
  }

  static unprocessableEntity(
    message: string,
    operationName: string,
    data?: Record<string, unknown>,
  ) {
    return new ApiError(
      HttpStatus.Error.UnprocessableEntity,
      message,
      operationName,
      data,
    );
  }

  /**
   * Server Errors
   */
  static internalError(operationName?: string) {
    return new ApiError(
      HttpStatus.Error.InternalServerError,
      'Internal server error',
      operationName,
    );
  }

  toJSON(): ApiErrorResponse {
    return {
      status: this.status,
      message: this.message,
      operationName: this.operationName,
      data: this.data,
      statusText: this.statusText,
    };
  }
}
