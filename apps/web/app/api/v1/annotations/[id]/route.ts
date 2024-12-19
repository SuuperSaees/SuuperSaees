import { NextRequest } from 'next/server';

import { AnnotationController } from '../controllers/annotation.controller';

const annotationController = new AnnotationController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return annotationController.get(req, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return annotationController.update(req, { params });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string } },
) {
  return annotationController.delete(undefined, { params });
}
