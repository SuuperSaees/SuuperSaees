import { BaseAction } from '../base-action';
import { Embeds } from '~/lib/embeds.types';
import { EmbedsController } from './controllers/embeds.controller';
import { IEmbedsAction } from './embeds.interface';

export class EmbedsAction extends BaseAction implements IEmbedsAction {
    private controller: EmbedsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new EmbedsController(this.baseUrl, this.client, this.adminClient);
    }
    async create(embed: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type> {
        return await this.controller.create(embed, accountIds);
    }

    async update(embedId: string, embed: Embeds.Update, accountIds?: string[]): Promise<Embeds.Type> {
        return this.controller.update(embedId, embed, accountIds);
    }

    async delete(embedId: string): Promise<void> {
        return this.controller.delete(embedId);
    }

    async get(embedId?: string): Promise<Embeds.TypeWithRelations> {
        return this.controller.get(embedId);
    }

    async list(organizationId?: string): Promise<Embeds.TypeWithRelations[]> {
        return this.controller.list(organizationId);
    }
}

export function createEmbedsAction(baseUrl: string) {
    return new EmbedsAction(baseUrl);
}
