import { Tags } from "~/lib/tags.types";

export interface ITagsService {
    create(payload: Tags.Insert, orderId?: number): Promise<Tags.Type>;
    update(payload: Tags.Update): Promise<Tags.Type>;
    delete(id: string): Promise<void>;
    get(id: string[]): Promise<Tags.Type[]>;
    list(organizationId: string, orderId?: number): Promise<Tags.Type[]>;
}