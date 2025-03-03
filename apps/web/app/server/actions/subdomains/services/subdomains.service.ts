import { ISubdomainsService } from "./subdomains.service.interface";
import { SubdomainsRepository } from "../repositories/subdomains.repository";
import { Subdomain } from "~/lib/subdomain.types";

export class SubdomainsService implements ISubdomainsService {
    constructor(private readonly subdomainsRepository: SubdomainsRepository) {
        this.subdomainsRepository = subdomainsRepository;
    }

    async create(payload: Subdomain.Insert): Promise<Subdomain.Type> {
        return await this.subdomainsRepository.create(payload);
    }

    async update(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type> {
        return await this.subdomainsRepository.update(payload, organizationId);
    }

    async delete(id: string): Promise<void> {
        return await this.subdomainsRepository.delete(id);
    }

    async get(ids: string[]): Promise<Subdomain.Type[]> {
        return await this.subdomainsRepository.get(ids);
    }

    async list(organizationId: string): Promise<Subdomain.Type[]> {
        return await this.subdomainsRepository.list(organizationId);
    }
}

