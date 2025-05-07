'use server'

import { createAccountsAction } from "./accounts";
import {cache } from 'react'

function getAccountsAction(host?: string) {
    return createAccountsAction(host ?? process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function getSessionAction() {
    const accountsAction = getAccountsAction();
    return await accountsAction.getSession();
}

export const getSession = cache(getSessionAction);
