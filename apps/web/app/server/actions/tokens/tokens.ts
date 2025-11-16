import { BaseAction } from "../base-action";
import { TokensController } from "./controllers/tokens.controller";
import { ITokensAction, Token, PayToken, TokenRecoveryType, TokenIdPayload, DefaultToken, SuuperApiKeyToken } from "./tokens.interface";
// import { Tokens } from "~/lib/tokens.types";

export class TokensAction extends BaseAction implements ITokensAction {
    private controller: TokensController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new TokensController(this.baseUrl, this.client, this.adminClient);
    }
    async createToken(payload: Token | PayToken | TokenRecoveryType | DefaultToken | SuuperApiKeyToken, tokenId?: string) {
        return await this.controller.createToken(payload, tokenId);
    }
    // decodeToken<T>(token: string, base: 'base64' | 'utf-8'): T | null {
    //     return this.controller.decodeToken(token, base);
    // }
    // async saveToken(token: Tokens.Insert) {
    //     return await this.controller.saveToken(token);
    // }
    // async revokeToken(tokenId: string) {
    //     return await this.controller.revokeToken(tokenId);
    // }
    async generateTokenId(payload: TokenIdPayload) {
        return await this.controller.generateTokenId(payload);
    }
}

export function createTokensAction(baseUrl: string) {
    return new TokensAction(baseUrl);
}