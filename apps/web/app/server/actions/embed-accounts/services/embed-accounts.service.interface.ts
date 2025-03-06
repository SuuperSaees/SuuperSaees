import { EmbedAccounts } from "~/lib/embed-accounts.types";

export interface IEmbedAccountsService {
    create(payload: EmbedAccounts.Insert[]): Promise<EmbedAccounts.Type[]>;
    update(embedId: string, accountIds: string[]): Promise<EmbedAccounts.Type[]>;
    delete(embedAccountId: string): Promise<void>;
    get(embedAccountId: string): Promise<EmbedAccounts.Type>;
    list(embedId: string): Promise<EmbedAccounts.Type[]>;
}
