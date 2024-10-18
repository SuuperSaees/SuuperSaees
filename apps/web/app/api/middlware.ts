import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.method === 'OPTIONS') {
    return handleCORSPreflight();
  }
  const response = NextResponse.next();

  // Config CORS Allow all origins
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  response.headers.append(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.headers.append('Access-Control-Max-Age', '86400');
  return response;
}

function handleCORSPreflight() {
  const response = new NextResponse();
  response.headers.append('Access-Control-Allow-Origin', '*');
  response.headers.append(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  return response;
}
