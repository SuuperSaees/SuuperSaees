import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { TokensRepository } from "../repositories/tokens.repository";
import { TokensService } from "../services/tokens.service";
import { Token, PayToken, TokenRecoveryType, TokenIdPayload, DefaultToken, SuuperApiKeyToken } from "../tokens.interface";

export class TokensController {
    private baseUrl: string;
    private client: SupabaseClient<Database>;
    private adminClient: SupabaseClient<Database>;

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async createToken(payload: Token | PayToken | TokenRecoveryType | DefaultToken | SuuperApiKeyToken, tokenId?: string) {
        try {
            const repository = new TokensRepository(this.baseUrl, this.client, this.adminClient);
            const service = new TokensService(repository);
            return await service.createToken(payload, tokenId);
        } catch (error) {
            console.error(error);
            throw new Error('Error creating token');
        }
    }

    async generateTokenId(payload: TokenIdPayload) {
        try {
            const repository = new TokensRepository(this.baseUrl, this.client, this.adminClient);
            const service = new TokensService(repository);
            return await service.generateTokenId(payload);
        } catch (error) {
            console.error(error);
            throw new Error('Error generating token id');
        }
    }
}