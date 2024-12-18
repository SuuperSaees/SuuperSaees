import { SupabaseClient } from '@supabase/supabase-js';

import { Annotations } from '~/lib/annotations.types';
import { Database } from '~/lib/database.types';

export interface IAnnotationRepository {
  createMessage(
    content: string,
    userId: string,
    fileId: string,
  ): Promise<{ id: string }>;
  createAnnotation(data: Annotations.Insert): Promise<Annotations.Type>;
  getAnnotationsByFile(fileId: string): Promise<Annotations.Type[]>;
  getParentMessage(annotationId: string): Promise<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
  }>;
  getChildMessages(parentMessageId: string): Promise<
    {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
    }[]
  >;
  updateStatus(
    annotationId: string,
    status: Annotations.AnnotationStatus,
  ): Promise<Annotations.Type>;
}

export class AnnotationRepository implements IAnnotationRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async createMessage(
    content: string,
    userId: string,
  ): Promise<{ id: string }> {
    const { data: message, error } = await this.client
      .from('messages')
      .insert({
        content,
        user_id: userId,
        type: 'annotation',
        order_id: 1,
      })
      .select('id')
      .single();

    if (error != null || !message) {
      throw new Error(
        `Error creating message: ${error?.message || 'Unknown error'}`,
      );
    }

    return message;
  }

  async createAnnotation(data: Annotations.Insert): Promise<Annotations.Type> {
    const { data: lastAnnotation, error: lastError } = await this.client
      .from('annotations')
      .select('number')
      .eq('file_id', data.file_id)
      .order('number', { ascending: false })
      .limit(1)
      .single();

    if (lastError && lastError.code !== 'PGRST116') {
      throw new Error(
        `Error fetching last annotation number: ${lastError.message}`,
      );
    }

    const nextNumber = lastAnnotation?.number ? lastAnnotation.number + 1 : 1;
    data.number = nextNumber;

    const { data: createdAnnotation, error } = await this.client
      .from('annotations')
      .insert(data)
      .select()
      .single();

    if (error != null || !createdAnnotation) {
      throw new Error(
        `Error creating annotation: ${error?.message || 'Unknown error'}`,
      );
    }

    return createdAnnotation as Annotations.Type;
  }

  async getAnnotationsByFile(fileId: string): Promise<Annotations.Type[]> {
    const { data: annotations, error } = await this.client
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
          messages:messages!inner(
            id,
            content,
            created_at
          )
        `,
      )
      .eq('file_id', fileId);

    if (error) {
      throw new Error(`Error fetching annotations: ${error.message}`);
    }

    return annotations as Annotations.Type[];
  }

  async getParentMessage(annotationId: string): Promise<{
    id: string;
    content: string;
    user_id: string;
    created_at: string;
  }> {
    const { data: parentMessage, error } = await this.client
      .from('messages')
      .select('id, content, user_id, created_at')
      .eq('annotations.id', annotationId)
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

  async getChildMessages(parentMessageId: string): Promise<
    {
      id: string;
      content: string;
      user_id: string;
      created_at: string;
    }[]
  > {
    const { data: childMessages, error } = await this.client
      .from('messages')
      .select('id, content, user_id, created_at')
      .eq('parent_id', parentMessageId);

    if (error) {
      throw new Error(`Error fetching child messages: ${error.message}`);
    }

    return childMessages.map((message) => ({
      ...message,
      content: message.content ?? '',
    }));
  }

  async updateStatus(
    annotationId: string,
    status: Annotations.AnnotationStatus,
  ): Promise<Annotations.Type> {
    const { data: updatedAnnotation, error } = await this.client
      .from('annotations')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', annotationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating annotation status: ${error.message}`);
    }

    if (!updatedAnnotation) {
      throw new Error('Annotation not found');
    }

    return updatedAnnotation as Annotations.Type;
  }

  async addMessageToAnnotation(
    parentId: string,
    content: string,
    userId: string,
  ): Promise<{ id: string }> {
    const { data: message, error } = await this.client
      .from('messages')
      .insert({
        content,
        user_id: userId,
        type: 'annotation',
        parent_id: parentId,
      })
      .select('id')
      .single();

    if (error != null || !message) {
      throw new Error(
        `Error adding message to annotation: ${error?.message || 'Unknown error'}`,
      );
    }

    return message;
  }
}
