'use server';

import { createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { Tokens } from '../../../apps/web/lib/tokens.types';
import { getSupabaseServerComponentClient } from '../../../packages/supabase/src/clients/server-component.client';
import { PayToken, Token, TokenRecoveryType } from './domain/token-type';

export async function createToken(
  payload: Token | PayToken | TokenRecoveryType,
): Promise<{ accessToken: string; tokenId: string }> {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };
  
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const signature = createHmac('sha256', process.env.JWT_SECRET!)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64');

  const accessToken = `${base64Header}.${base64Payload}.${signature}`;

  const refreshToken = Buffer.from(uuidv4() + 'suuper').toString('base64');
  const idTokenProvider = uuidv4() + 'suuper';

  const response = { accessToken, tokenId: idTokenProvider };

  const tokenData: Tokens.Insert = {
    access_token: accessToken,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    id_token_provider: idTokenProvider,
    provider: 'suuper',
    refresh_token: refreshToken,
    updated_at: now.toISOString(),
  };

 await Promise.resolve().then(async () => {
    try {
      const client = getSupabaseServerComponentClient({ admin: true });
      const { error } = await client.from('tokens').insert(tokenData);
      
      if (error) {
        console.error('Failed to store token:', {
          error: error.message,
          code: error.code,
          details: error.details
        });
      }
    } catch (err) {
      console.error('Unexpected error storing token:', err);
    }
  });
  
  return response;
}