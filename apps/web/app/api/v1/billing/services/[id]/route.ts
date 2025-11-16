import { NextRequest } from 'next/server';

import { ServiceController } from '../controllers/services.controller';

const serviceController = new ServiceController();

export async function GET({ params }: { params: { id: string } }) {
  return serviceController.get(undefined, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return serviceController.update(req, { params });
}

export async function DELETE({ params }: { params: { id: string } }) {
  return serviceController.delete(undefined, { params });
}
