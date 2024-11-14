'use server';
import { getTokenData } from '../get/get-token';
import { decodeToken } from '../../../../../../../tokens/src/decode-token';


export const decodeTokenData = async (tokenId: string) => {
  try {
    const token = await getTokenData(tokenId);

    const decodedToken = decodeToken(token?.access_token ?? '');

    return decodedToken;
  } catch (error) {
    console.error('Error fetching token:', error);
  }
};
