import { ITagsService } from "./tags.service.interface";
import { TagsRepository } from "../repositories/tags.repository";
import { Tags } from "~/lib/tags.types";
import { OrderTagsRepository } from "../../order-tags/repositories/order-tags.repository";

export class TagsService implements ITagsService {
    constructor(private readonly tagsRepository: TagsRepository, private readonly orderTagsRepository?: OrderTagsRepository) {
        this.tagsRepository = tagsRepository;
        this.orderTagsRepository = orderTagsRepository;
    }

    async create(payload: Tags.Insert, orderId?: number): Promise<Tags.Type> {
        const tag = await this.tagsRepository.create(payload);
        if (orderId) {
            await this.orderTagsRepository?.create({
                order_id: orderId,
                tag_id: tag.id
            });
        }
        return tag;
    }

    async update(payload: Tags.Update): Promise<Tags.Type> {
        return await this.tagsRepository.update(payload);
    }

    async delete(id: string): Promise<void> {
        await this.orderTagsRepository?.delete(id);
        return await this.tagsRepository.delete(id);
    }

    async get(ids: string[]): Promise<Tags.Type[]> {
        return await this.tagsRepository.get(ids);
    }

    async list(organizationId: string, orderId?: number): Promise<Tags.Type[]> {
        if (orderId) {
            const orderTags = await this.orderTagsRepository?.get(orderId);
            const tagIds = orderTags?.map((orderTag) => orderTag.tag_id ?? '') ?? [];
            return await this.tagsRepository.get(tagIds);
        }
        return await this.tagsRepository.list(organizationId);
    }
}
