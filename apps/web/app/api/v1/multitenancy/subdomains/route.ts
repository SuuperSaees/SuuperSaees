import { NextRequest } from 'next/server';

import { createIngressAndSubdomain } from './create';
import { deleteIngressAndSubdomain } from './delete';
import { getIngressAndSubdomain } from './get';

export async function POST(req: NextRequest) {
  return createIngressAndSubdomain(req);
}

export async function DELETE(req: NextRequest) {
  return deleteIngressAndSubdomain(req);
}

export async function GET(req: NextRequest) {
  return getIngressAndSubdomain(req);
}
