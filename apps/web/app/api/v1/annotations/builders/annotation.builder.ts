import { randomUUID } from 'crypto';

import { Annotation } from '~/lib/annotations.types';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';

export class AnnotationBuilder {
  private annotationInsert: Annotation.Insert = {
    id: randomUUID(),
    file_id: '',
    user_id: '',
    status: 'active',
    position_x: 0,
    position_y: 0,
    page_number: null,
    number: null,
    message_id: '',
    deleted_on: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  private updateData: Partial<Annotation.Update> = {};

  setFileId(fileId: string) {
    this.annotationInsert.file_id = fileId;
    return this;
  }

  setUserId(userId: string) {
    this.annotationInsert.user_id = userId;
    return this;
  }

  setStatus(status: Annotation.AnnotationStatus) {
    this.annotationInsert.status = status;
    return this;
  }

  setNumber(number: number | null) {
    this.annotationInsert.number = number;
    return this;
  }

  setPosition(positionX: number, positionY: number) {
    this.annotationInsert.position_x = positionX;
    this.annotationInsert.position_y = positionY;
    return this;
  }

  setPageNumber(pageNumber: number | null) {
    this.annotationInsert.page_number = pageNumber;
    return this;
  }

  setMessageId(messageId: string) {
    this.annotationInsert.message_id = messageId;
    return this;
  }

  buildAnnotationInsert(): Annotation.Insert {
    return {
      ...this.annotationInsert,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  setUpdateData(updateData: Partial<Annotation.Update>) {
    this.updateData = { ...this.updateData, ...updateData };
    return this;
  }

  buildUpdate(): Partial<Annotation.Update> {
    return {
      ...this.updateData,
      updated_at: new Date().toISOString(),
    };
  }

  static fromDTO(
    dto: CreateAnnotationDTO,
    messageId: string,
    number: number,
  ): Annotation.Insert {
    const builder = new AnnotationBuilder();
    return builder
      .setFileId(dto.file_id)
      .setUserId(dto.user_id)
      .setStatus(dto.status)
      .setPosition(dto.position_x, dto.position_y)
      .setPageNumber(dto.page_number ?? null)
      .setMessageId(messageId)
      .setNumber(number)
      .buildAnnotationInsert();
  }

  static buildDeletedAnnotation(
    annotationId: string,
  ): Partial<Annotation.Update> {
    const builder = new AnnotationBuilder();
    return builder
      .setUpdateData({ deleted_on: new Date().toISOString() })
      .setUpdateData({ id: annotationId })
      .buildUpdate();
  }
}
