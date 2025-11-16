
import { Subdomain } from '~/lib/subdomain.types';

export interface ISubdomainsAction {
    create(payload: Subdomain.Insert): Promise<Subdomain.Type>;
    update(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type>;
    delete(id: string): Promise<void>;
    get(ids: string[]): Promise<Subdomain.Type[]>;
    list(organizationId: string): Promise<Subdomain.Type[]>;
}
