import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class CredentialsCrypto {
  private readonly algorithm = 'aes-256-gcm';
  private readonly encoding = 'hex';

  constructor(private readonly secretKey: Buffer) {
    if (secretKey.length !== 32) {
      // 256 bits
      throw new Error('Secret key must be 32 bytes for AES-256');
    }
  }

  encrypt(data: object): EncryptedCredentials {
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, this.secretKey, iv);

    const jsonData = JSON.stringify(data);
    const encrypted = Buffer.concat([
      cipher.update(jsonData, 'utf8'),
      cipher.final(),
    ]);

    return {
      data: encrypted.toString(this.encoding),
      iv: iv.toString(this.encoding),
      version: 1, // For future encryption method updates. LAST UPDATE: 2024-11-26 by jairo-holgado.
      tag: cipher.getAuthTag().toString(this.encoding),
    };
  }

  decrypt<T>(encryptedData: EncryptedCredentials): T {
    const decipher = createDecipheriv(
      this.algorithm,
      this.secretKey,
      Buffer.from(encryptedData.iv, this.encoding),
    );

    decipher.setAuthTag(Buffer.from(encryptedData.tag, this.encoding));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.data, this.encoding)),
      decipher.final(),
    ]);

    const decryptedString: string = decrypted.toString('utf8');
    const parsedData: T = JSON.parse(decryptedString);

    return parsedData;
  }
}

export interface EncryptedCredentials {
  data: string;
  iv: string;
  version: number;
  tag: string;
}

export interface Credentials {
  username: string;
  password: string;
  created_at: string;
}

export interface TreliCredentials {
  treli_user: string;
  treli_password: string;
  webhook_url: string;
}
