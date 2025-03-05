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

export async function createEmbedAccount(embedAccount: EmbedAccounts.Insert) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.create(embedAccount);
}

export async function updateEmbedAccount(embedAccountId: string, embedAccount: EmbedAccounts.Update) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.update(embedAccountId, embedAccount);
}

export async function deleteEmbedAccount(embedAccountId: string) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.delete(embedAccountId);
}

export async function getEmbedAccounts(embedId: string) {
    const embedAccountAction = getEmbedAccountAction();
    return await embedAccountAction.list(embedId);
}
