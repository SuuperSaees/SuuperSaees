import { NextRequest } from 'next/server';



import { z } from 'zod';



import { getLogger } from '@kit/shared/logger';
import { HttpStatus, statusCodeMap } from '@kit/shared/response';



import { ApiError } from './api-error';


type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    status: HttpStatus.Error;
    message: string;
    operationName?: string;
    statusText?: string;
    data?: Record<string, unknown> | Array<unknown> | null;
  };
  requestId: string;
  timestamp: string;
};

export abstract class BaseController {
  protected abstract delete(
    req?: NextRequest,
    params?: unknown,
  ): Promise<Response>;
  protected abstract update(
    req?: NextRequest,
    params?: unknown,
  ): Promise<Response>;
  protected abstract get(
    req?: NextRequest,
    params?: unknown,
  ): Promise<Response>;
  protected abstract create(req: NextRequest): Promise<Response>;
  protected abstract list(req?: NextRequest): Promise<Response>;

  protected async handleRequest<T>(
    action: () => Promise<T>,
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const result = await action();
      return this.ok(result, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  protected async parseBody<T>(req: NextRequest): Promise<T> {
    try {
      const body = await req.clone().json();
      return body as T;
    } catch (error) {
      throw ApiError.badRequest(
        'Data is required',
        'failedToParseBody',
      );
    }
  }

  /**
   * Success Responses
   */
  protected ok<T>(data: T, requestId: string): Response {
    return this.jsonResponse<T>(
      {
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.Success.OK,
    );
  }

  protected created<T>(data: T, requestId: string): Response {
    return this.jsonResponse<T>(
      {
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.Success.Created,
    );
  }

  /**
   * Error Handling
   */
  protected badRequest(message: string, requestId: string): Response {
    return this.jsonResponse(
      {
        success: false,
        error: {
          status: HttpStatus.Error.BadRequest,
          message,
          statusText: statusCodeMap[HttpStatus.Error.BadRequest],
        },
        requestId,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.Error.BadRequest,
    );
  }

  protected internalError(requestId: string): Response {
    return this.jsonResponse(
      {
        success: false,
        error: {
          status: HttpStatus.Error.InternalServerError,
          message: 'Internal server error',
          statusText: statusCodeMap[HttpStatus.Error.InternalServerError],
        },
        requestId,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.Error.InternalServerError,
    );
  }

  protected async handleError(
    error: unknown,
    requestId: string,
  ): Promise<Response> {
    const logger = await getLogger();

    if (error instanceof z.ZodError) {
      return this.badRequest(
        error.errors[0]?.message ?? 'Validation failed',
        requestId,
      );
    }

    if (error instanceof ApiError) {
      logger.warn(
        {
          requestId,
          error: error.toJSON(),
        },
        'Operation failed',
      );

      return this.jsonResponse(
        {
          success: false,
          error: error.toJSON(),
          requestId,
          timestamp: new Date().toISOString(),
        },
        error.status,
      );
    }

    logger.error(
      {
        requestId,
        error:
          error instanceof Error
            ? {
                message: error.message,
                stack: error.stack,
                name: error.name,
              }
            : error,
      },
      'Unexpected error occurred',
    );

    return this.internalError(requestId);
  }

  private jsonResponse<T>(
    data: ApiResponse<T>,
    status: HttpStatus.Success | HttpStatus.Error,
  ): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': data.requestId,
      },
    });
  }
}