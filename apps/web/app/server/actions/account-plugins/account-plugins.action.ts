'use server';

import { createAccountPluginsAction } from "./account-plugins";
import { AccountPluginInsert } from "~/lib/plugins.types";

function getAccountPluginsAction() {
    return createAccountPluginsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createAccountPlugin(payload: AccountPluginInsert) {
    return await getAccountPluginsAction().create(payload);
}

export async function updateAccountPlugin(id: string, payload: Partial<AccountPluginInsert> & {
    provider?: string;
    provider_id?: string;
  }) {
    return await getAccountPluginsAction().update(id, payload);
}

export async function deleteAccountPlugin(id: string, accountId: string, provider: string) {
    return await getAccountPluginsAction().delete(id, accountId, provider);
}

export async function getAccountPlugin(id?: string, name?: string) {
    return await getAccountPluginsAction().get(id, name);
}

export async function getAccountPlugins(accountId: string, limit = 10, offset = 0) {
    return await getAccountPluginsAction().list(accountId, limit, offset);
}
