import { Session } from "../../../../lib/account.types";

export interface IAccountsAction {
    getSession(): Promise<Session.Type>;
} 