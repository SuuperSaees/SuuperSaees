'use server';

import { Tokens } from '../../../apps/web/lib/tokens.types';
import { getSupabaseServerComponentClient } from '../../../packages/supabase/src/clients/server-component.client';
import { PayToken, TokenRecoveryType, DefaultToken, SuuperApiKeyToken } from './domain/token-type';

const { sha256 } = Tokens.EXTRA_TOKENS_KEYS;

// Cache for storing recently verified tokens
const tokenCache = new Map<string, {
  isValidToken: boolean;
  payload?: PayToken | TokenRecoveryType | DefaultToken;
  timestamp: number;
}>();

// Cache expiration time in ms (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Helper function to use Web Crypto API
async function createHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyToken(
  accessToken?: string,
  idTokenProvider?: string,
  validateExpired = true,
): Promise<{
  isValidToken: boolean;
  payload?: PayToken | TokenRecoveryType | DefaultToken | SuuperApiKeyToken;
}> {
  // Create a unique cache key
  const cacheKey = `${accessToken}-${idTokenProvider}-${validateExpired}`;
  
  // Check if the token is in cache and has not expired
  const cachedResult = tokenCache.get(cacheKey);
  console.log('cachedResult', cachedResult);
  if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_EXPIRATION) {
    return {
      isValidToken: cachedResult.isValidToken,
      payload: cachedResult.payload
    };
  }
  
  const client = getSupabaseServerComponentClient({
    admin: true,
  });
  
  try {
    // Optimize: Build the query more efficiently
    const query = client
      .from('tokens')
      .select('access_token,expires_at');
    
    // Add conditions only if parameters are present
    if (accessToken && idTokenProvider) {
      query.eq('access_token', accessToken).eq('id_token_provider', idTokenProvider);
    } else if (accessToken && !idTokenProvider) {
      query.eq('access_token', accessToken);
    } else if (!accessToken && idTokenProvider) {
      query.eq('id_token_provider', idTokenProvider);
    } else {
      // If there are no parameters, return quickly
      return { isValidToken: false };
    }
    
    const { data, error } = await query.single();
    
    if (error || !data) {
      console.error('Token not found in database');
      
      // Cache the negative result
      tokenCache.set(cacheKey, {
        isValidToken: false,
        timestamp: Date.now()
      });
      
      return {
        isValidToken: false,
      };
    }

    accessToken = data.access_token;
    // Split the token into its parts
    const [base64Header, base64Payload, signature] =
      accessToken?.split('.') ?? [];

    // Decodificar el payload una sola vez
    const payload = JSON.parse(
      Buffer.from(base64Payload ?? '', 'base64').toString('utf-8'),
    );

    // Verificar la firma
    const expectedSignature = await createHmacSignature(
      `${base64Header}.${base64Payload}`,
      process.env.JWT_SECRET!
    );

    if (signature !== expectedSignature) {
      console.error('Invalid token signature');
      
      // Guardar en caché el resultado negativo
      tokenCache.set(cacheKey, {
        isValidToken: false,
        timestamp: Date.now()
      });
      
      return {
        isValidToken: false,
      };
    }

    // Verificar la expiración del token
    if (validateExpired) {
      const now = new Date();
      const expiresAt = new Date(data.expires_at ?? '');

      if (now >= expiresAt) {
        console.error('Token has expired');
        
        // Guardar en caché el resultado negativo con el payload
        tokenCache.set(cacheKey, {
          isValidToken: false,
          payload,
          timestamp: Date.now()
        });
        
        return {
          isValidToken: false,
          payload,
        };
      }
    }

    // Guardar en caché el resultado positivo
    tokenCache.set(cacheKey, {
      isValidToken: true,
      payload,
      timestamp: Date.now()
    });

    return {
      isValidToken: true,
      payload,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    return {
      isValidToken: false,
    };
  }
}
