import { IAccountsService } from "./accounts.service.interface";
import { AccountsRepository } from "../repositories/accounts.repository";
import { Session } from "../../../../../lib/account.types";

export class AccountsService implements IAccountsService {
    constructor(private readonly accountsRepository: AccountsRepository) {
        this.accountsRepository = accountsRepository;
    }

    async getSession(): Promise<Session.Type> {
        return await this.accountsRepository.getSession();
    }

    async getUserRole(): Promise<string> {
        return await this.accountsRepository.getUserRole();
    }
} 