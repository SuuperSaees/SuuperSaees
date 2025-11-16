import { NextRequest } from 'next/server';

import { ErrorAnnotationOperations } from '@kit/shared/response';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { ApiError } from '~/lib/api/api-error';
import { BaseController } from '~/lib/api/base-controller';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';
import { createAnnotationService } from '../services/annotation.service';

export class AnnotationController extends BaseController {
  async create(req: NextRequest): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const body = await this.parseBody<
        CreateAnnotationDTO & { parent_id?: string }
      >(req);

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      if (body.parent_id) {
        const message = await annotationService.addMessageToAnnotation(
          body.parent_id,
          body.content,
          body.user_id,
        );
        return this.created(
          {
            id: message.id,
            message: message.message,
            created_at: message.created_at,
          },
          requestId,
        );
      }

      if (
        !body.file_id ||
        !body.user_id ||
        body.position_x === undefined ||
        body.position_y === undefined
      ) {
        throw ApiError.badRequest(
          'File ID, User ID, Position X, and Position Y are required',
          ErrorAnnotationOperations.FAILED_TO_CREATE_ANNOTATION,
        );
      }

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
      const fileId = searchParams.get('file_id')
      const otherFileIds = searchParams.get('other_file_ids')?.split(',');

      if (!fileId) {
        throw ApiError.badRequest(
          'The file_id query parameter is required',
          ErrorAnnotationOperations.FAILED_TO_LIST_ANNOTATIONS,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const annotations = await annotationService.listAnnotations(fileId, otherFileIds);
      return this.ok(
        {
          current_file: annotations.currentFile || [],
          other_files: annotations.otherFiles || [],
        },
        requestId,
      );
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async get(
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const parentId = params.id;

      if (!parentId) {
        throw ApiError.badRequest(
          'The id parameter is required',
          ErrorAnnotationOperations.FAILED_TO_FIND_MESSAGES,
        );
      }

      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') ?? '10', 10);
      const offset = parseInt(searchParams.get('offset') ?? '0', 10);

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      const result = await annotationService.getMessages(
        parentId,
        limit,
        offset,
      );
      return this.ok(result, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async update(
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const annotationId = params.id;

      if (!annotationId) {
        throw ApiError.badRequest(
          'The id parameter is required',
          ErrorAnnotationOperations.FAILED_TO_UPDATE_ANNOTATION,
        );
      }

      const body = await this.parseBody<{
        status: 'active' | 'completed' | 'draft';
        first_message?: string;
        message_id?: string;
      }>(req);

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
        body.status,
      );

      return this.ok(updatedAnnotation, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }

  async delete(
    _: undefined,
    { params }: { params: { id: string } },
  ): Promise<Response> {
    const requestId = crypto.randomUUID();

    try {
      const annotationId = params.id;

      if (!annotationId) {
        throw ApiError.badRequest(
          'The id parameter is required',
          ErrorAnnotationOperations.FAILED_TO_DELETE_ANNOTATION,
        );
      }

      const client = getSupabaseServerComponentClient({ admin: true });
      const annotationService = await createAnnotationService(client);

      await annotationService.softDeleteAnnotation(annotationId);

      return this.ok({ message: 'Annotation deleted successfully' }, requestId);
    } catch (error) {
      return this.handleError(error, requestId);
    }
  }
}
