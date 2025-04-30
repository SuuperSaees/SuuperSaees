import { TokensRepository } from "../repositories/tokens.repository";
import { Token, PayToken, TokenRecoveryType, TokenIdPayload, DefaultToken, SuuperApiKeyToken } from "../tokens.interface";
import { ITokensService } from "./tokens.service.interface";
import { v4 as uuidv4 } from 'uuid';
import { createHmac } from 'crypto';
import { Tokens } from "~/lib/tokens.types";
export class TokensService implements ITokensService {
    private tokensRepository: TokensRepository;

    constructor(tokensRepository: TokensRepository) {
        this.tokensRepository = tokensRepository;
    }

    async createToken(payload: Token | PayToken | TokenRecoveryType | DefaultToken | SuuperApiKeyToken, tokenId?: string) {
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
          const idTokenProvider = tokenId ?? await this.generateTokenId({id: ''});
        const response = { accessToken, tokenId: idTokenProvider };

        const tokenData: Tokens.Insert = {
         id: payload.id ?? uuidv4(),
         access_token: accessToken,
         created_at: now.toISOString(),
         expires_at: expiresAt.toISOString(),
         id_token_provider: idTokenProvider,
         provider: 'suuper',
         refresh_token: refreshToken,
         updated_at: now.toISOString(),
        };
        const token = await this.tokensRepository.createToken(tokenData);
        console.log('token', token?.data);
        return response;
    }

    async generateTokenId({id}: TokenIdPayload) {
        // If id is not empty, search in the database if the id is already in use
        if (id) {
            const token = await this.tokensRepository
            .getTokenById(id);
            if (token) {
                return token.id_token_provider;
            }
        }
        return uuidv4() + 'suuper';
    }
}