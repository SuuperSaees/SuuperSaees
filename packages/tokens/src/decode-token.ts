/**
 * Decodes a JSON Web Token (JWT) and returns its payload.
 *
 * @param token - The JWT as a string, typically consisting of three parts separated by dots.
 * @returns The decoded payload of the JWT as an object.
 * @throws Will throw an error if the token is not properly formatted or if the payload cannot be parsed.
 */
export function decodeToken<T>(
  token: string,
  base: 'base64' | 'utf-8' = 'base64',
): T | null {
  const [base64Header, base64Payload] = token.split('.');
  // Decode the payload
  const payload = JSON.parse(
    Buffer.from(base64Payload ?? '', base).toString('utf-8'),
  );

  return payload;
}
