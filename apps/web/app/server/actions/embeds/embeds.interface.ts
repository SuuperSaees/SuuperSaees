import { Embeds } from "~/lib/embeds.types";
export interface IEmbedsAction {
    create(embed: Embeds.Insert, accountIds?: string[]): Promise<Embeds.Type>;
    update(embedId: string, embed: Embeds.Update, accountIds?: string[]): Promise<Embeds.Type>;
    delete(embedId: string): Promise<void>;
    get(embedId?: string): Promise<Embeds.TypeWithRelations>;
    list(organizationId?: string): Promise<Embeds.TypeWithRelations[]>;
}

