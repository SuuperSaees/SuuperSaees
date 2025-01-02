'use server';

import { createHmac } from 'crypto';

import { Tokens } from '../../../apps/web/lib/tokens.types';
import { getSupabaseServerComponentClient } from '../../../packages/supabase/src/clients/server-component.client';
import { PayToken, TokenRecoveryType, DefaultToken } from './domain/token-type';

const { sha256 } = Tokens.EXTRA_TOKENS_KEYS;

export async function verifyToken(
  accessToken?: string,
  idTokenProvider?: string,
): Promise<{
  isValidToken: boolean;
  payload?: PayToken | TokenRecoveryType | DefaultToken;
}> {
  const client = getSupabaseServerComponentClient({
    admin: true,
  });
  try {
    // Verify the token is in the database
    const { data, error } = await client
      .from('tokens')
      .select('access_token,expires_at')
      .or(
        `access_token.eq.${accessToken},id_token_provider.eq.${idTokenProvider}`,
      )
      .single();
    if (error || !data) {
      console.error('Token not found in database');
      return {
        isValidToken: false,
      };
    }

    accessToken = data.access_token;
    // Split the token into its parts
    const [base64Header, base64Payload, signature] =
      accessToken?.split('.') ?? [];

    // Decode the header and payload
    // const payload = JSON.parse(Buffer.from(base64Payload ?? "", 'base64').toString('utf-8'));

    // Verify the signature
    const expectedSignature = createHmac(sha256, process.env.JWT_SECRET!)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64');

    const payload = JSON.parse(
      Buffer.from(base64Payload ?? '', 'base64').toString('utf-8'),
    );

    if (signature !== expectedSignature) {
      console.error('Invalid token signature');
      return {
        isValidToken: false,
      };
    }

    // Verify the token has not expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at ?? '');

    if (now >= expiresAt) {
      console.error('Token has expired');
      return {
        isValidToken: false,
        payload,
      };
    }

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
