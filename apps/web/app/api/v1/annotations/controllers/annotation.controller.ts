import { NextRequest } from 'next/server';

import { ErrorAnnotationOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { Annotations } from '~/lib/annotations.types';
import { ApiError } from '~/lib/api/api-error';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';
import { createAnnotationService } from '../services/annotation.service';

export class AnnotationController {
  async create(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const body = await this.parseBody<CreateAnnotationDTO>(req);

      if (!body.content || !body.file_id || !body.user_id) {
        throw ApiError.badRequest(
          'Content, File ID, and User ID are required',
          ErrorAnnotationOperations.FAILED_TO_CREATE_ANNOTATION,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const annotation = await annotationService.createAnnotation(body);

      return this.created(annotation, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async list(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const { searchParams } = new URL(req.url);
      const fileId = searchParams.get('file_id');

      if (!fileId) {
        throw ApiError.badRequest(
          'The file_id query parameter is required',
          ErrorAnnotationOperations.FAILED_TO_LIST_ANNOTATIONS,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const annotations = await annotationService.listAnnotations(fileId);

      return new Response(
        JSON.stringify({
          success: true,
          data: annotations,
          requestId,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async getMessages(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const { searchParams } = new URL(req.url);
      const annotationId = searchParams.get('annotation_id');

      if (!annotationId) {
        throw ApiError.badRequest(
          'The annotation_id query parameter is required',
          ErrorAnnotationOperations.FAILED_TO_FIND_ANNOTATION,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const messages = await annotationService.getMessages(annotationId);

      return new Response(
        JSON.stringify({
          success: true,
          data: messages,
          requestId,
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async updateStatus(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const { searchParams } = new URL(req.url);
      const annotationId = searchParams.get('annotation_id');

      if (!annotationId) {
        throw ApiError.badRequest(
          'The annotation_id query parameter is required',
          ErrorAnnotationOperations.FAILED_TO_UPDATE_ANNOTATION,
        );
      }

      const body = await this.parseBody<{ status: string }>(req);

      if (!body.status) {
        throw ApiError.badRequest(
          'The status field is required',
          ErrorAnnotationOperations.FAILED_TO_UPDATE_ANNOTATION,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const updatedAnnotation = await annotationService.updateAnnotationStatus(
        annotationId,
        body.status as Annotations.AnnotationStatus,
      );

      return this.ok(updatedAnnotation, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  private ok<T>(data: T, requestId: string): Response {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  private async parseBody<T>(req: NextRequest): Promise<T> {
    const body = await req.clone().json();
    return body as T;
  }

  private created<T>(data: T, requestId: string): Response {
    return new Response(
      JSON.stringify({
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  }

  private handleError(error: unknown, requestId: string): Response {
    if (error instanceof ApiError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: error.toJSON(),
          requestId,
          timestamp: new Date().toISOString(),
        }),
        { status: error.status },
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Internal server error',
          requestId,
          timestamp: new Date().toISOString(),
        },
      }),
      { status: 500 },
    );
  }

  async addMessage(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const body = await this.parseBody<{
        annotation_id: string;
        content: string;
        user_id: string;
      }>(req);

      if (!body.annotation_id || !body.content || !body.user_id) {
        throw ApiError.badRequest(
          'Annotation ID, content, and user ID are required',
          ErrorAnnotationOperations.FAILED_TO_ADD_MESSAGE,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const message = await annotationService.addMessageToAnnotation(
        body.annotation_id,
        body.content,
        body.user_id,
      );

      return this.created(message, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }
}
