'use server'

import { createAccountsAction } from "./accounts";

function getAccountsAction(host?: string) {
    return createAccountsAction(host ?? process.env.NEXT_PUBLIC_SITE_URL as string);
}

export const getSession =async () => {
    const accountsAction = getAccountsAction();
    const session = await accountsAction.getSession();
    return session;
}
