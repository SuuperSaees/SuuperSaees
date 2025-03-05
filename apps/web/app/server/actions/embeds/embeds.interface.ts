import { Embeds } from "~/lib/embeds.types";
export interface IEmbedsAction {
    create(embed: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type>;
    update(embedId: string, embed: Embeds.Update): Promise<Embeds.Type>;
    delete(embedId: string): Promise<void>;
    get(embedId?: string): Promise<Embeds.Type>;
    list(organizationId: string): Promise<Embeds.Type[]>;
}

