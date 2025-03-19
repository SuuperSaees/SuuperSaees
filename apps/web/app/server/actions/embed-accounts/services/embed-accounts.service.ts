import { IEmbedAccountsService } from "./embed-accounts.service.interface";
import { EmbedAccountsRepository } from "../repositories/embed-accounts.repository";
import { EmbedAccounts } from "~/lib/embed-accounts.types";

export class EmbedAccountsService implements IEmbedAccountsService {
    constructor(private readonly embedAccountsRepository: EmbedAccountsRepository) {
        this.embedAccountsRepository = embedAccountsRepository;
    }

    async create(payload: EmbedAccounts.Insert[]): Promise<EmbedAccounts.Type[]> {
        return await this.embedAccountsRepository.create(payload);
    }

    async update(embedId: string, accountIds: string[]): Promise<EmbedAccounts.Type[]> {
        return await this.embedAccountsRepository.update(embedId, accountIds);
    }

    async delete(embedAccountId: string): Promise<void> {
        return await this.embedAccountsRepository.delete(embedAccountId);
    }

    async get(embedAccountId: string): Promise<EmbedAccounts.Type> {
        return await this.embedAccountsRepository.get(embedAccountId);
    }

    async list(embedId: string): Promise<EmbedAccounts.Type[]> {
        return await this.embedAccountsRepository.list(embedId);
    }
}
