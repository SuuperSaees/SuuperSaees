import { NextRequest } from 'next/server';

import { AnnotationController } from '../controllers/annotation.controller';

const annotationController = new AnnotationController();

export async function GET(req: NextRequest) {
  return annotationController.getMessages(req);
}

export async function PATCH(req: NextRequest) {
  return annotationController.updateStatus(req);
}

export async function POST(req: NextRequest) {
  return annotationController.addMessage(req);
}
