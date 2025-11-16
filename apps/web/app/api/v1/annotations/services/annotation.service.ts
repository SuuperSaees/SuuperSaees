import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { ErrorAnnotationOperations } from '@kit/shared/response';

import { Annotation } from '~/lib/annotations.types';
import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';
import { AnnotationRepository } from '../repositories/annotation.repository';

export class AnnotationService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly annotationRepository: AnnotationRepository,
  ) {}

  async createAnnotation(
    data: CreateAnnotationDTO,
  ): Promise<Annotation.Type & { message: string }> {
    try {
      this.logger.info({ fileId: data.file_id }, 'Creating annotation');

      const message = await this.annotationRepository.createMessage(
        data.content,
        data.user_id,
        '',
      );

      const annotationData = {
        file_id: data.file_id,
        user_id: data.user_id,
        position_x: data.position_x,
        position_y: data.position_y,
        page_number: data.page_number ?? null,
        status: data.status ?? 'active',
        message_id: message.id,
      };

      const annotation =
        await this.annotationRepository.createAnnotation(annotationData);

      this.logger.info(
        { id: annotation.id },
        'Annotation created successfully',
      );

      return { ...annotation, message: message.content };
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create annotation');
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorAnnotationOperations.FAILED_TO_CREATE_ANNOTATION,
          );
    }
  }

  async listAnnotations(fileId: string, otherFileIds?: string[]): Promise<{
    currentFile: Annotation.Type[];
    otherFiles: Annotation.Type[];
  }> {
    try {
      const annotations =
        await this.annotationRepository.getAnnotationsByFile(fileId, otherFileIds);

      return {
        currentFile: annotations.currentFile,
        otherFiles: annotations.otherFiles,
      };
    } catch (error) {
      throw ApiError.internalError(
        ErrorAnnotationOperations.FAILED_TO_LIST_ANNOTATIONS,
      );
    }
  }

  async getMessages(
    annotationId: string,
    limit: number,
    offset: number,
  ): Promise<{
    parent: {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
    };
    children: {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
      accounts: {
        name: string;
        user_settings: {
          picture_url: string;
        };
      };
    }[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const parentMessage =
      await this.annotationRepository.getParentMessage(annotationId);

    if (!parentMessage) {
      throw ApiError.notFound(
        `Parent message for annotation ${annotationId} not found`,
        ErrorAnnotationOperations.ANNOTATION_NOT_FOUND,
      );
    }

    const childMessages = await this.annotationRepository.getChildMessages(
      parentMessage.id,
      limit,
      offset,
    );

    const transformedChildren = childMessages.map((child) => ({
      ...child,
      accounts: {
        name: child.accounts?.name ?? 'Unknown',
        user_settings: {
          picture_url: child.accounts?.settings?.picture_url ?? '',
        },
      },
    }));

    const total = await this.annotationRepository.countChildMessages(
      parentMessage.id,
    );

    return {
      parent: parentMessage,
      children: transformedChildren,
      total,
      limit,
      offset,
    };
  }

  async updateAnnotationStatus(
    annotationId: string,
    status: Annotation.AnnotationStatus,
  ): Promise<Annotation.Type> {
    try {
      this.logger.info({ annotationId, status }, 'Updating annotation status');

      const updatedAnnotation = await this.annotationRepository.updateStatus(
        annotationId,
        status,
      );

      this.logger.info(
        { annotationId, status },
        'Annotation status updated successfully',
      );

      return updatedAnnotation;
    } catch (error) {
      this.logger.error(
        { error, annotationId, status },
        'Failed to update annotation status',
      );

      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorAnnotationOperations.FAILED_TO_UPDATE_ANNOTATION,
          );
    }
  }

  async addMessageToAnnotation(
    parentId: string,
    content: string,
    userId: string,
  ): Promise<{ id: string; message: string; created_at: string }> {
    try {
      this.logger.info({ parentId, userId }, 'Adding message to annotation');

      const message = await this.annotationRepository.createMessage(
        content,
        userId,
        parentId,
      );

      this.logger.info(
        { messageId: message.id },
        'Message added to annotation successfully',
      );

      return {
        id: message.id,
        message: message.content,
        created_at: message.created_at,
      };
    } catch (error) {
      this.logger.error(
        { error, parentId, userId },
        'Failed to add message to annotation',
      );

      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorAnnotationOperations.FAILED_TO_ADD_MESSAGE,
          );
    }
  }

  async softDeleteAnnotation(annotationId: string): Promise<void> {
    try {
      this.logger.info({ annotationId }, 'Soft deleting annotation');

      await this.annotationRepository.softDelete(annotationId);

      this.logger.info(
        { annotationId },
        'Annotation soft deleted successfully',
      );
    } catch (error) {
      this.logger.error(
        { error, annotationId },
        'Failed to soft delete annotation',
      );

      throw ApiError.internalError(
        ErrorAnnotationOperations.FAILED_TO_DELETE_ANNOTATION,
      );
    }
  }
}

export const createAnnotationService = async (
  client: SupabaseClient<Database>,
): Promise<AnnotationService> => {
  const logger = await createLogger();
  const annotationRepository = new AnnotationRepository(client);
  return new AnnotationService(logger, annotationRepository);
};
