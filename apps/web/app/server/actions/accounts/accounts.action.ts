'use server'

import { createAccountsAction } from "./accounts";
import { cookies } from 'next/headers';
import { Session } from "~/lib/account.types";

function getAccountsAction(host?: string) {
    return createAccountsAction(host ?? process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function getSessionAction() {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session_info');
    
    if (sessionCookie) {
        try {
            const sessionData = JSON.parse(sessionCookie.value);
            if (sessionCookie.expires && new Date(sessionCookie.expires) > new Date()) {
                return sessionData as Session.Type;
            }
        } catch (error) {
            console.error(error);
        }
    }
    
    const accountsAction = getAccountsAction();
    const session = await accountsAction.getSession();
    
    return session;
}

export async function getSession() {
    return await getSessionAction();
}
