import { Embeds } from "~/lib/embeds.types";

export interface IEmbedsService {
    create(payload: Embeds.Insert): Promise<Embeds.Type>;
    update(embedId: string, payload: Embeds.Update): Promise<Embeds.Type>;
    delete(embedId: string): Promise<void>;
    get(embedId?: string): Promise<Embeds.TypeWithRelations>;
    list(organizationId?: string, role?: string, agencyId?: string): Promise<Embeds.TypeWithRelations[]>;
}
