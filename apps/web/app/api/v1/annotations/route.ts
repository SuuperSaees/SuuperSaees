import { NextRequest } from 'next/server';

import { AnnotationController } from './controllers/annotation.controller';

const annotationController = new AnnotationController();

export async function POST(req: NextRequest) {
  return annotationController.create(req);
}

export async function GET(req: NextRequest) {
  return annotationController.list(req);
}
