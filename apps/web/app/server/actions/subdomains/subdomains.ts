import { Subdomain } from '~/lib/subdomain.types';
import { BaseAction } from '../base-action';
import { ISubdomainsAction } from './subdomains.interface';
import { SubdomainsController } from './controllers/subdomains.controller';


class SubdomainsAction extends BaseAction implements ISubdomainsAction {
    private controller: SubdomainsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new SubdomainsController(this.baseUrl, this.client, this.adminClient);
    }

    async create(payload: Subdomain.Insert): Promise<Subdomain.Type> {
        return await this.controller.create(payload);
    }

    async update(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type> {
        return await this.controller.update(payload, organizationId);
    }

    async delete(id: string): Promise<void> {
        return await this.controller.delete(id);
    }

    async get(ids: string[]): Promise<Subdomain.Type[]> {
        return await this.controller.get(ids);
    }

    async list(organizationId: string): Promise<Subdomain.Type[]> {
        return await this.controller.list(organizationId);
    }
}

export function createSubdomainsAction(baseUrl: string) {
    return new SubdomainsAction(baseUrl);
}
