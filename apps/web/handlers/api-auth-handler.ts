import 'server-only';

import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = 'dev_b9806c46-8348-4347-a639-7ac223f17546suuper.co';
const CLIENT_SECRET =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwMjk0ZmM2LWJlODItNGE5Zi04ZDIyLTNjZDc0ZDAwODJjZSIsIm5hbWUiOiJzYW11ZWwiLCJlbWFpbCI6InNhbXVlbEBzdXVwZXIuY28iLCJkb21haW4iOiJzdXVwZXIuY28ifQ.Q3rEzb3evSkVZgJeIYtJtRn_5f2xUG1HHxRnVoACDV0';

export function handleApiAuth(request: NextRequest) {

  if (request.nextUrl.pathname === '/api/v1/webhook' || request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    if (!isValidBasicAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  return null;
}

function isValidBasicAuth(request: NextRequest): boolean {
  const authorizationHeader = request.headers.get('authorization');
  if (!authorizationHeader?.startsWith('Basic ')) {
    return false;
  }
  const base64Credentials = authorizationHeader.split(' ')[1];
  const credentials = atob(base64Credentials!).split(':');
  const clientId = credentials[0];
  const clientSecret = credentials[1];
  return clientId === CLIENT_ID && clientSecret === CLIENT_SECRET;
}
