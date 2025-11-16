import 'server-only';

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../../../packages/tokens/src/verify-token';

const CLIENT_ID = 'dev_b9806c46-8348-4347-a639-7ac223f17546suuper.co';
const CLIENT_SECRET =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjkwMjk0ZmM2LWJlODItNGE5Zi04ZDIyLTNjZDc0ZDAwODJjZSIsIm5hbWUiOiJzYW11ZWwiLCJlbWFpbCI6InNhbXVlbEBzdXVwZXIuY28iLCJkb21haW4iOiJzdXVwZXIuY28ifQ.Q3rEzb3evSkVZgJeIYtJtRn_5f2xUG1HHxRnVoACDV0';

export async function handleApiAuth(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/v1/webhook') {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith('/api/v1')) {
    // Check for API key in Authorization header
    const authorizationHeader = request.headers.get('Authorization');
    
    // First try to validate as API key
    if (authorizationHeader?.startsWith('suuper_')) {
      if (request.nextUrl.pathname.startsWith('/api/v1/briefs') || request.nextUrl.pathname.startsWith('/api/v1/orders')) {
      const apiKey = authorizationHeader;
      const { isValid, headers } = await validateApiKey(apiKey ?? '');

      if (isValid) {
        // Crear una nueva respuesta con los headers modificados
        const response = NextResponse.next();
        
        // Añadir los headers de autenticación a la respuesta
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(`x-suuper-${key}`, value);
        });
        
        return response;
      }
    }
      
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Invalid API key. Please check your credentials and try again.' 
      }, { status: 401 });
    }
    
    // Fall back to basic auth if no Bearer token
    if (!isValidBasicAuth(request)) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        message: 'Authentication required. Please provide valid credentials.' 
      }, { status: 401 });
    } else {
      return NextResponse.next();
    }
  }
  
  return null;
}

async function validateApiKey(apiKey: string): Promise<{isValid: boolean, headers: Record<string, string>}> {
  try {
    // Check if the API key starts with "suuper_"
    if (!apiKey.startsWith('suuper_')) {
      console.error('Invalid API key format: missing suuper_ prefix');
      return { isValid: false, headers: {} };
    }
    
    // Split the API key by underscore
    const [_, tokenPart, encodedIdPart] = apiKey.split('_');
    
    if (!tokenPart || !encodedIdPart) {
      console.error('Invalid API key format: missing parts');
      return { isValid: false, headers: {} };
    }
    
    // Decode the ID token provider from base64
    const idTokenProvider = Buffer.from(encodedIdPart, 'base64').toString('utf-8');
    
    // Verify the token using the verifyToken function
    const { isValidToken, payload } = await verifyToken(tokenPart, idTokenProvider, false);
    
    if (!isValidToken || !payload) {
      console.error('API key verification failed');
      return { isValid: false, headers: {} };
    }

    // Crear un objeto para almacenar los headers
    const headers: Record<string, string> = {};
    
    if ('user_id' in payload) {
      headers.user_id = payload.user_id as string;
    }
    if ('organization_id' in payload) {
      headers.organization_id = payload.organization_id;
    }
    if ('role' in payload) {
      headers.role = payload.role as string;
    }
    if ('domain' in payload) {
      headers.domain = payload.domain as string;
    }
    if ('agency_id' in payload) {
      headers.agency_id = payload.agency_id;
    }
    
    return { isValid: true, headers };
  } catch (error) {
    console.error('Error validating API key:', error);
    return { isValid: false, headers: {} };
  }
}

function isValidBasicAuth(request: NextRequest): boolean {
  // Buscar el header de autorización en ambos formatos (mayúscula y minúscula)
  const authorizationHeader = request.headers.get('authorization') ?? request.headers.get('Authorization');
  if (!authorizationHeader?.startsWith('Basic ')) {
    return false;
  }
  const base64Credentials = authorizationHeader.split(' ')[1];
  const credentials = atob(base64Credentials!).split(':');
  const clientId = credentials[0];
  const clientSecret = credentials[1];
  return clientId === CLIENT_ID && clientSecret === CLIENT_SECRET;
}
