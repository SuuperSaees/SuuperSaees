import { NextRequest } from 'next/server';

import { ServiceController } from './controllers/services.controller';

const serviceController = new ServiceController();

export async function POST(req: NextRequest) {
  return serviceController.create(req);
}

export async function LIST(req: NextRequest) {
  return serviceController.list(req);
}
