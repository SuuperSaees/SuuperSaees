import { IEmbedsService } from "./embeds.service.interface";
import { EmbedsRepository } from "../repositories/embeds.repository";
import { Embeds } from "~/lib/embeds.types";
import { EmbedAccountsRepository } from "../../embed-accounts/repositories/embed-accounts.repository";
import { SecurityService } from "../../security/services/security.service";

export class EmbedsService implements IEmbedsService {
    private securityService: SecurityService;

    constructor(
        private readonly embedsRepository: EmbedsRepository, 
        private readonly embedAccountsRepository?: EmbedAccountsRepository
    ) {
        this.embedsRepository = embedsRepository;
        this.embedAccountsRepository = embedAccountsRepository;
        this.securityService = new SecurityService();
    }

    async create(payload: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type> {
        // Validate the data before creating
        this.securityService.validateEmbedData(payload);
        
        const embedCreated = await this.embedsRepository.create(payload);

        const embedAccounts = accountIds?.map((accountId) => ({
            embed_id: embedCreated.id,
            account_id: accountId,
        }));

        if (embedAccounts && embedCreated.visibility === 'private') {
            await this.embedAccountsRepository?.create(embedAccounts);
        }

        return embedCreated;
    }

    async update(embedId: string, payload: Embeds.Update): Promise<Embeds.Type> {
        // Validate the data before updating
        this.securityService.validateEmbedData(payload);
        
        const embedUpdated = await this.embedsRepository.update(embedId, payload);

        return embedUpdated;
    }

    async delete(embedId: string): Promise<void> {
        return await this.embedsRepository.delete(embedId);
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        const embed = await this.embedsRepository.get(embedId);

        return embed;
    }
    
    async list(organizationId?: string, role?: string, agencyId?: string): Promise<Embeds.TypeWithRelations[]> {
        return await this.embedsRepository.list(organizationId, role, agencyId);
    }
}
