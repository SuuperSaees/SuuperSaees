import { NextRequest } from 'next/server';

import { OrderController } from '../controllers/order.controller';

const orderController = new OrderController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return orderController.get(req, { params });
}
