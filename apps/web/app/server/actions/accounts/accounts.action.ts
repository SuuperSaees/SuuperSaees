'use server'

import { createAccountsAction } from "./accounts";
import { unstable_cache } from "next/cache";
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { revalidateTag } from 'next/cache';
import { getLogger } from "@kit/shared/logger";

// function getAccountsAction(host?: string) {
//     return createAccountsAction(host ?? process.env.NEXT_PUBLIC_SITE_URL as string);
// }

// Function not cacheable that obtains the Supabase client
export async function getSession() {
    const logger = await getLogger();
    const client = getSupabaseServerComponentClient();
    const adminClient = getSupabaseServerComponentClient({ admin: true });
    const accountSession = await getSessionWithClients(client, adminClient);
    logger.info(accountSession, 'new session obtained...');
    return accountSession;
}

// Function cacheable that receives the clients as arguments
const getSessionWithClients = unstable_cache(
    async (client, adminClient) => {

        const accountsAction = createAccountsAction(
            process.env.NEXT_PUBLIC_SITE_URL as string, 
            client, 
            adminClient
        );
        const accountSession = await accountsAction.getSession();
        return accountSession;
    }, 
    ['session-cache-key'], 
    {
        tags: ['session-cache'],
        revalidate: process.env.NEXT_PUBLIC_IS_PROD ? 18000: 10
    }
);

export async function revalidateSession() {
    await Promise.resolve();
    revalidateTag('session-cache');
    return { success: true };
}


export async function getUserRole() {
    const client = getSupabaseServerComponentClient();
    const adminClient = getSupabaseServerComponentClient({ admin: true });
    return getUserRoleWithClients(client, adminClient);
}

const getUserRoleWithClients = unstable_cache(
    async (client, adminClient) => {
        const accountsAction = createAccountsAction(
            process.env.NEXT_PUBLIC_SITE_URL as string, 
            client, 
            adminClient
        );
        return await accountsAction.getUserRole();
    }, 
    ['user-role-cache-key'], 
    {
        tags: ['user-role-cache'],
        revalidate: 86400
    }
);