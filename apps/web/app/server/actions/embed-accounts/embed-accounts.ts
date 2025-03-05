import { BaseAction } from '../base-action';
import { EmbedAccounts } from '~/lib/embed-accounts.types';
import { EmbedAccountsController } from './controllers/embed-accounts.controller';
import { IEmbedAccountsAction } from './embed-accounts.interface';

export class EmbedAccountsAction extends BaseAction implements IEmbedAccountsAction {
    private controller: EmbedAccountsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new EmbedAccountsController(this.baseUrl, this.client, this.adminClient);
    }

    async create(embedAccount: EmbedAccounts.Insert): Promise<EmbedAccounts.Type> {
        return await this.controller.create(embedAccount);
    }

    async update(embedAccountId: string, embedAccount: EmbedAccounts.Update): Promise<EmbedAccounts.Type> {
        return this.controller.update(embedAccountId, embedAccount);
    }

    async delete(embedAccountId: string): Promise<void> {
        return this.controller.delete(embedAccountId);
    }

    async get(embedAccountId: string): Promise<EmbedAccounts.Type> {
        return this.controller.get(embedAccountId);
    }

    async list(embedId: string): Promise<EmbedAccounts.Type[]> {
        return this.controller.list(embedId);
    }
}

export function createEmbedAccountsAction(baseUrl: string) {
    return new EmbedAccountsAction(baseUrl);
}
