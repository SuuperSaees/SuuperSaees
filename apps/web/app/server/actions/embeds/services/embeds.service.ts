import { IEmbedsService } from "./embeds.service.interface";
import { EmbedsRepository } from "../repositories/embeds.repository";
import { Embeds } from "~/lib/embeds.types";
import { EmbedAccountsRepository } from "../../embed-accounts/repositories/embed-accounts.repository";

export class EmbedsService implements IEmbedsService {

    constructor(
        private readonly embedsRepository: EmbedsRepository, 
        private readonly embedAccountsRepository?: EmbedAccountsRepository
    ) {
        this.embedsRepository = embedsRepository;
        this.embedAccountsRepository = embedAccountsRepository;
    }

    async create(payload: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type> {
        
        const embedCreated = await this.embedsRepository.create(payload);

        const embedAccounts = accountIds?.map((accountId) => ({
            embed_id: embedCreated.id,
            organization_id: accountId,
        }));

        if (embedAccounts && embedCreated.visibility === 'private') {
            await this.embedAccountsRepository?.create(embedAccounts);
        }

        return embedCreated;
    }

    async update(embedId: string, payload: Embeds.Update, accountIds?: string[]): Promise<Embeds.Type> {
        
        const embedUpdated = await this.embedsRepository.update(embedId, payload);

        if (accountIds && embedUpdated.visibility === 'private') {
            await this.embedAccountsRepository?.update(embedId, accountIds);
        }
        return embedUpdated;
    }

    async delete(embedId: string): Promise<void> {
        return await this.embedsRepository.delete(embedId);
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        const embed = await this.embedsRepository.get(embedId);

        return embed;
    }
    
    async list(organizationId?: string): Promise<Embeds.TypeWithRelations[]> {
        return await this.embedsRepository.list(organizationId);
    }
}
