import { EmbedAccounts } from "~/lib/embed-accounts.types";

export interface IEmbedAccountsAction {
    create(embedAccount: EmbedAccounts.Insert): Promise<EmbedAccounts.Type>;
    update(embedAccountId: string, embedAccount: EmbedAccounts.Update): Promise<EmbedAccounts.Type>;
    delete(embedAccountId: string): Promise<void>;
    get(embedAccountId: string): Promise<EmbedAccounts.Type>;
    list(embedId: string): Promise<EmbedAccounts.Type[]>;
}
