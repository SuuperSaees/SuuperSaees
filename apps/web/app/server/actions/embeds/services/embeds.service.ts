import { IEmbedsService } from "./embeds.service.interface";
import { EmbedsRepository } from "../repositories/embeds.repository";
import { Embeds } from "~/lib/embeds.types";

export class EmbedsService implements IEmbedsService {
    constructor(private readonly embedsRepository: EmbedsRepository) {
        this.embedsRepository = embedsRepository;
    }

    async create(payload: Embeds.Insert): Promise<Embeds.Type> {
        return await this.embedsRepository.create(payload);
    }

    async update(embedId: string, payload: Embeds.Update): Promise<Embeds.Type> {
        return await this.embedsRepository.update(embedId, payload);
    }

    async delete(embedId: string): Promise<void> {
        return await this.embedsRepository.delete(embedId);
    }

    async get(embedId?: string): Promise<Embeds.Type> {
        return await this.embedsRepository.get(embedId);
    }

    async list(organizationId: string): Promise<Embeds.Type[]> {
        return await this.embedsRepository.list(organizationId);
    }
}
