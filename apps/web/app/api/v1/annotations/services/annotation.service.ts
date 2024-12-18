import { SupabaseClient } from '@supabase/supabase-js';

import { Logger as LoggerInstance, createLogger } from '@kit/shared/logger';
import { ErrorAnnotationOperations } from '@kit/shared/response';

import { Annotations } from '~/lib/annotations.types';
import { ApiError } from '~/lib/api/api-error';
import { Database } from '~/lib/database.types';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';
import { AnnotationRepository } from '../repositories/annotation.repository';

export class AnnotationService {
  constructor(
    private readonly logger: LoggerInstance,
    private readonly annotationRepository: AnnotationRepository,
  ) {}

  async createAnnotation(data: CreateAnnotationDTO): Promise<Annotations.Type> {
    try {
      this.logger.info({ fileId: data.file_id }, 'Creating annotation');

      const message = await this.annotationRepository.createMessage(
        data.content,
        data.user_id,
      );

      const annotationData = {
        ...data,
        message_id: message.id,
      };

      const annotation =
        await this.annotationRepository.createAnnotation(annotationData);

      this.logger.info(
        { id: annotation.id },
        'Annotation created successfully',
      );

      return annotation;
    } catch (error) {
      this.logger.error({ error, data }, 'Failed to create annotation');
      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorAnnotationOperations.FAILED_TO_CREATE_ANNOTATION,
          );
    }
  }

  async listAnnotations(fileId: string): Promise<{
    currentFile: Annotations.Type[];
    otherFiles: Annotations.Type[];
  }> {
    try {
      this.logger.info({ fileId }, 'Fetching annotations');

      const annotations =
        await this.annotationRepository.getAnnotationsByFile(fileId);

      const currentFileAnnotations = annotations.filter(
        (annotation) => annotation.file_id === fileId,
      );
      const otherFileAnnotations = annotations.filter(
        (annotation) => annotation.file_id !== fileId,
      );

      this.logger.info({ fileId }, 'Annotations fetched successfully');

      return {
        currentFile: currentFileAnnotations,
        otherFiles: otherFileAnnotations,
      };
    } catch (error) {
      this.logger.error({ error, fileId }, 'Failed to fetch annotations');
      throw ApiError.internalError(
        ErrorAnnotationOperations.FAILED_TO_LIST_ANNOTATIONS,
      );
    }
  }

  async getMessages(annotationId: string): Promise<{
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
    }[];
  }> {
    try {
      this.logger.info({ annotationId }, 'Fetching messages for annotation');

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
      );

      this.logger.info({ annotationId }, 'Messages fetched successfully');

      return {
        parent: parentMessage,
        children: childMessages,
      };
    } catch (error) {
      this.logger.error({ error, annotationId }, 'Failed to fetch messages');
      throw ApiError.internalError(
        ErrorAnnotationOperations.FAILED_TO_LIST_MESSAGES,
      );
    }
  }

  async updateAnnotationStatus(
    annotationId: string,
    status: Annotations.AnnotationStatus,
  ): Promise<Annotations.Type> {
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
    annotationId: string,
    content: string,
    userId: string,
  ): Promise<{ id: string }> {
    try {
      this.logger.info(
        { annotationId, userId },
        'Adding message to annotation',
      );

      const message = await this.annotationRepository.addMessageToAnnotation(
        annotationId,
        content,
        userId,
      );

      this.logger.info(
        { messageId: message.id },
        'Message added to annotation successfully',
      );

      return message;
    } catch (error) {
      this.logger.error(
        { error, annotationId, userId },
        'Failed to add message to annotation',
      );

      throw error instanceof ApiError
        ? error
        : ApiError.internalError(
            ErrorAnnotationOperations.FAILED_TO_ADD_MESSAGE,
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
