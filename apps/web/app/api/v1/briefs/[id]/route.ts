import { NextRequest } from 'next/server';

import { BriefController } from '../controllers/brief.controller';

const briefController = new BriefController();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return briefController.get(req, { params });
}
