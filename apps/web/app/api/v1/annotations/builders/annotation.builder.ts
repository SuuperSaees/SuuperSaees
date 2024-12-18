import { randomUUID } from 'crypto';

import { Annotations } from '~/lib/annotations.types';

import { CreateAnnotationDTO } from '../dtos/annotation.dto';

export class AnnotationBuilder {
  private annotationInsert: Annotations.Insert = {
    id: randomUUID(),
    file_id: '',
    user_id: '',
    status: 'active',
    position_x: 0,
    position_y: 0,
    page_number: null,
    message_id: '',
    deleted_on: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  private updateData: Partial<Annotations.Update> = {};

  setFileId(fileId: string) {
    this.annotationInsert.file_id = fileId;
    return this;
  }

  setUserId(userId: string) {
    this.annotationInsert.user_id = userId;
    return this;
  }

  setStatus(status: Annotations.AnnotationStatus) {
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

  buildAnnotationInsert(): Annotations.Insert {
    return {
      ...this.annotationInsert,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  buildUpdate(): Partial<Annotations.Update> {
    return {
      ...this.updateData,
      updated_at: new Date().toISOString(),
    };
  }

  static fromDTO(
    dto: CreateAnnotationDTO,
    messageId: string,
    number: number,
  ): Annotations.Insert {
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
}
