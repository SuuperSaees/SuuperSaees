import { NextRequest } from 'next/server';

import { AccountController } from '../controllers/account.controller';

const accountController = new AccountController();

export async function GET({ params }: { params: { id: string } }) {
  return accountController.get(undefined, { params });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return accountController.update(req, { params });
}

export async function DELETE({ params }: { params: { id: string } }) {
  return accountController.delete(undefined, { params });
}
