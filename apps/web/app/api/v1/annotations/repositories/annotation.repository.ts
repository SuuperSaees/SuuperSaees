import { SupabaseClient } from '@supabase/supabase-js';

import { randomUUID } from 'crypto';

import { Annotation } from '~/lib/annotations.types';
import { Database } from '~/lib/database.types';

export interface IAnnotationRepository {
  createMessage(
    content: string,
    userId: string,
    parentId: string,
  ): Promise<{ id: string; content: string }>;
  createAnnotation(data: Annotation.Insert): Promise<Annotation.Type>;
  getAnnotationsByFile(fileId: string): Promise<{
    currentFile: Annotation.Type[];
    otherFiles: Annotation.Type[];
  }>;
  getChildMessages(
    parentMessageId: string,
    limit: number,
    offset: number,
  ): Promise<
    {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
    }[]
  >;
  updateStatus(
    annotationId: string,
    status: Annotation.AnnotationStatus,
  ): Promise<Annotation.Type>;
  softDelete(annotationId: string): Promise<void>;
}

export class AnnotationRepository implements IAnnotationRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async createMessage(
    content: string,
    userId: string,
    parentId: string,
  ): Promise<{ id: string; content: string; created_at: string }> {
    const { data: message, error } = await this.client
      .from('messages')
      .insert({
        content,
        user_id: userId,
        type: 'annotation',
        parent_id: parentId || null,
      })
      .select('id, content, created_at')
      .single();

    if (error ?? !message) {
      throw new Error(
        `Error creating message: ${error?.message || 'Unknown error'}`,
      );
    }

    if (!message.content) {
      throw new Error('Message content cannot be null');
    }

    return {
      id: message.id,
      content: message.content,
      created_at: message.created_at,
    };
  }

  async createAnnotation(data: Annotation.Insert): Promise<Annotation.Type> {
    const {
      file_id,
      user_id,
      position_x,
      position_y,
      page_number = null,
      status = 'active',
      message_id = null,
    } = data;

    const { data: activeAnnotations, error: activeError } = await this.client
      .from('annotations')
      .select('number')
      .eq('file_id', file_id)
      .is('deleted_on', null)
      .order('number', { ascending: true });

    if (activeError) {
      throw new Error(`Error fetching annotations: ${activeError.message}`);
    }

    let nextNumber = 1;
    const usedNumbers = activeAnnotations.map((a) => a.number);
    while (usedNumbers.includes(nextNumber)) {
      nextNumber++;
    }

    const annotationData: Annotation.Insert = {
      id: randomUUID(),
      file_id,
      user_id,
      position_x,
      position_y,
      page_number,
      status,
      number: nextNumber,
      message_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_on: null,
    };

    const { data: createdAnnotation, error } = await this.client
      .from('annotations')
      .insert(annotationData)
      .select('*, accounts(name, settings:user_settings(picture_url))')
      .single();

    if (error ?? !createdAnnotation) {
      throw new Error(
        `Error creating annotation: ${error?.message || 'Unknown error'}`,
      );
    }

    return createdAnnotation as Annotation.Type;
  }

  async getAnnotationsByFile(fileId: string, otherFileIds?: string[]): Promise<{
    currentFile: Annotation.Type[];
    otherFiles: Annotation.Type[];
  }> {
    const allFileIds = [fileId, ...(otherFileIds ?? [])];

    const query = this.client
    .from('annotations')
    .select(
      `
      id,
      file_id,
      user_id,
      position_x,
      position_y,
      status,
      created_at,
      updated_at,
      deleted_on,
      page_number,
      number,
      message_id,
      messages(content, created_at),
      accounts(name, settings:user_settings(picture_url))
    `,
    )
    .in('file_id', allFileIds)
    .is('deleted_on', null);

    const { data: annotations, error: annotationsError } = await query;

    if (annotationsError && annotationsError.code !== 'PGRST116') {
      throw new Error(
        `Error fetching annotations: ${annotationsError.message}`,
      );
    }


    const cleanedAnnotations = annotations?.map((annotation) => ({
      ...annotation,
      accounts: annotation.accounts ? {
        ...annotation.accounts,
        settings: annotation.accounts?.settings?.[0] ?? null,
      } : null,
    }));

    const currentFileAnnotations = cleanedAnnotations?.filter(
      (annotation) => annotation.file_id === fileId,
    );
    const otherFileAnnotations = cleanedAnnotations?.filter(
      (annotation) => annotation.file_id !== fileId,
    );

    const formattedCurrentFileAnnotations = currentFileAnnotations?.map(
      (annotation) => ({
        ...annotation,
        message_content: annotation.messages?.content ?? null,
        message_created_at: annotation.messages?.created_at ?? null,
        messages: undefined, 
      }),
    );

    const formattedOtherFileAnnotations = otherFileAnnotations?.map(
      (annotation) => ({
        ...annotation,
        message_content: annotation.messages?.content ?? null,
        message_created_at: annotation.messages?.created_at ?? null,
        messages: undefined, 
      }),
    );

    return {
      currentFile: formattedCurrentFileAnnotations as Annotation.Type[],
      otherFiles: formattedOtherFileAnnotations as Annotation.Type[],
    };
  }

  async getChildMessages(
    parentMessageId: string,
    limit: number,
    offset: number,
  ): Promise<
    {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
      accounts: {
        name: string;
        settings: {
          picture_url: string | null;
        } | null;
      } | null;
    }[]
  > {
    const { data: childMessages, error } = await this.client
      .from('messages')
      .select(
        'id, content, user_id, created_at, accounts(name, settings:user_settings(picture_url))',
      )
      .eq('parent_id', parentMessageId)
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Error fetching child messages: ${error.message}`);
    }

    return childMessages.map((message) => ({
      ...message,
      content: message.content ?? '',
      accounts: message.accounts ? {
        ...message.accounts,
        settings: message.accounts?.settings?.[0] ?? null,
      } : null,
    }));
  }

  async countChildMessages(parentMessageId: string): Promise<number> {
    const { count, error } = await this.client
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', parentMessageId);

    if (error) {
      throw new Error(`Error counting child messages: ${error.message}`);
    }

    return count ?? 0;
  }

  async getParentMessage(annotationId: string): Promise<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
  }> {
    const { data: annotation, error: annotationError } = await this.client
      .from('annotations')
      .select('message_id')
      .eq('id', annotationId)
      .single();

    if (annotationError) {
      throw new Error(`Error fetching annotation: ${annotationError.message}`);
    }

    if (!annotation.message_id) {
      throw new Error('Annotation message_id not found');
    }

    const { data: parentMessage, error } = await this.client
      .from('messages')
      .select('id, content, user_id, created_at')
      .eq('id', annotation.message_id)
      .single();

    if (error) {
      throw new Error(`Error fetching parent message: ${error.message}`);
    }

    if (!parentMessage) {
      throw new Error('Parent message not found');
    }

    return {
      ...parentMessage,
      content: parentMessage.content ?? '',
    };
  }

  async updateStatus(
    annotationId: string,
    status: Annotation.AnnotationStatus,
  ): Promise<Annotation.Type> {
    const { data: updatedAnnotation, error } = await this.client
      .from('annotations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', annotationId)
      .select()
      .single();

    if (error ?? !updatedAnnotation) {
      throw new Error(
        `Error updating annotation status: ${error?.message || 'Annotation not found'}`,
      );
    }

    return updatedAnnotation as Annotation.Type;
  }

  async softDelete(annotationId: string): Promise<void> {
    const { error } = await this.client
      .from('annotations')
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', annotationId);

    if (error) {
      throw new Error(`Error deleting annotation: ${error.message}`);
    }
  }
}
