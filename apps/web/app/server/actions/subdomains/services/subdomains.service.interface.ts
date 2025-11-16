import { Subdomain } from "~/lib/subdomain.types";
export interface ISubdomainsService {
    create(payload: Subdomain.Insert): Promise<Subdomain.Type>;
    update(payload: Subdomain.Update): Promise<Subdomain.Type>;
    delete(id: string): Promise<void>;
    get(ids: string[]): Promise<Subdomain.Type[]>;
    list(organizationId: string, orderId?: number): Promise<Subdomain.Type[]>;
}
