import { NextRequest } from 'next/server';



import { AccountController } from '../controllers/account.controller';


const accountController = new AccountController();

export async function GET({ params }: { params: { id: string } }) {
  return accountController.get(undefined, { params });
}

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } },
) {
  return accountController.update(req, context);
}

export async function DELETE(
  request: Request,
  context: { params: { id: string } },
) {
  return accountController.delete(undefined, context);
}