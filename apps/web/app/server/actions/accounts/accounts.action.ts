'use server'

import { createAccountsAction } from "./accounts";
import { unstable_cache } from "next/cache";
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

// function getAccountsAction(host?: string) {
//     return createAccountsAction(host ?? process.env.NEXT_PUBLIC_SITE_URL as string);
// }

// Function not cacheable that obtains the Supabase client
export async function getSession() {
    const client = getSupabaseServerComponentClient();
    const adminClient = getSupabaseServerComponentClient({ admin: true });
    return getSessionWithClients(client, adminClient);
}

// Function cacheable that receives the clients as arguments
const getSessionWithClients = unstable_cache(
    async (client, adminClient) => {
        const accountsAction = createAccountsAction(
            process.env.NEXT_PUBLIC_SITE_URL as string, 
            client, 
            adminClient
        );
        return await accountsAction.getSession();
    }, 
    ['session-cache-key'], 
    {
        tags: ['session-cache'],
        revalidate: 18000
    }
);

