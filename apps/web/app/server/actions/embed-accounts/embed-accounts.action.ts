'use server';

import { createEmbedAccountsAction } from "./embed-accounts";
import { EmbedAccounts } from "~/lib/embed-accounts.types";

function getEmbedAccountAction() {
    return createEmbedAccountsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function getEmbedAccount(embedAccountId: string) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.get(embedAccountId);
}

export async function createEmbedAccounts(embedAccounts: EmbedAccounts.Insert[]) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.create(embedAccounts);
}

export async function updateEmbedAccounts(embedId: string, accountIds: string[]) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.update(embedId, accountIds);
}

export async function deleteEmbedAccount(embedAccountId: string) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.delete(embedAccountId);
}

export async function getEmbedAccounts(embedId: string) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.list(embedId);
}
