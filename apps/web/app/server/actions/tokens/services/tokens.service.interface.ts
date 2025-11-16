import { Token, PayToken, TokenRecoveryType, TokenIdPayload } from "../tokens.interface";

export interface ITokensService {
    createToken: (payload: Token | PayToken | TokenRecoveryType) => Promise<{ accessToken: string; tokenId: string }>;
    generateTokenId: (payload: TokenIdPayload) => Promise<string>;
}
