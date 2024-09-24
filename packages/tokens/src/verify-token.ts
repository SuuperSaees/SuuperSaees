import { createHmac } from 'crypto';
import { getSupabaseServerComponentClient } from '../../../packages/supabase/src/clients/server-component.client';
import { Tokens } from '../../../apps/web/lib/tokens.types';

const client = getSupabaseServerComponentClient();

export async function verifyToken(accessToken: string): Promise<boolean> {
  try {
    // Split the token into its parts
    const [base64Header, base64Payload, signature] = accessToken.split('.');

    // Decode the header and payload
    // const payload = JSON.parse(Buffer.from(base64Payload ?? "", 'base64').toString('utf-8'));

    // Verify the signature
    const expectedSignature = createHmac('sha256', process.env.JWT_SECRET!)
      .update(`${base64Header}.${base64Payload}`)
      .digest('base64');

    if (signature !== expectedSignature) {
      console.error('Invalid token signature');
      return false;
    }

    // Verify the token is in the database
    const { data, error } = await client
      .from('tokens')
      .select('expires_at')
      .eq('access_token', accessToken)
      .single();

    if (error || !data) {
      console.error('Token not found in database');
      return false;
    }

    // Verify the token has not expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at ?? "");

    if (now >= expiresAt) {
      console.error('Token has expired');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}