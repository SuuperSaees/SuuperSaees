'use server';

import { decodeToken } from '../../../../../../../tokens/src/decode-token';
import { getTokenData } from '../get/get-token';

export const decodeTokenData = async <T>(
  tokenId: string,
): Promise<T | null> => {
  try {
    const token = await getTokenData(tokenId);

    if (!token) return null;

    const decodedToken = decodeToken<T>(token?.access_token ?? '');

    if (!decodedToken) return null;

    return decodedToken as T;
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
};