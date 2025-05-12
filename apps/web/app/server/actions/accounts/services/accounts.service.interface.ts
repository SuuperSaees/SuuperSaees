import { Session } from "../../../../../lib/account.types";

export interface IAccountsService {
    getSession(): Promise<Session.Type>;
} 