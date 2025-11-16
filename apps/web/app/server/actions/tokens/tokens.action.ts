'use server';
import { createTokensAction } from "./tokens";
import { Token, PayToken, TokenRecoveryType, DefaultToken, SuuperApiKeyToken } from "./tokens.interface";

const tokensAction = createTokensAction("");

export async function createToken(payload: Token | PayToken | TokenRecoveryType | DefaultToken | SuuperApiKeyToken, tokenId?: string) {
    if(!tokensAction) return;
    return await tokensAction.createToken(payload, tokenId);
}

export async function generateTokenId(payload: {id: string}) {
    if(!tokensAction) return;
    return await tokensAction.generateTokenId(payload);
}