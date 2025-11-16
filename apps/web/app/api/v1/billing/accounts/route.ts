import { NextRequest } from 'next/server';

import { AccountController } from './controllers/account.controller';

const accountController = new AccountController();

export async function POST(req: NextRequest) {
  return accountController.create(req);
}

export async function GET(req: NextRequest) {
  return accountController.list(req);
}
