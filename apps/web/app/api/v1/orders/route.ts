import { NextRequest } from 'next/server';

import { OrderController } from './controllers/order.controller';

const orderController = new OrderController();

export async function POST(req: NextRequest) {
  return orderController.create(req);
}

export async function GET(req: NextRequest) {
  return orderController.list(req);
}
