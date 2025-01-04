import { ITagsService } from "./tags.service.interface";
import { TagsRepository } from "../repositories/tags.repository";
import { Tags } from "~/lib/tags.types";

export class TagsService implements ITagsService {
    constructor(private readonly tagsRepository: TagsRepository) {
        this.tagsRepository = tagsRepository;
    }

    async create(payload: Tags.Insert): Promise<Tags.Type> {
        return await this.tagsRepository.create(payload);
    }

    async update(payload: Tags.Update): Promise<Tags.Type> {
        return await this.tagsRepository.update(payload);
    }

    async delete(id: string): Promise<void> {
        return await this.tagsRepository.delete(id);
    }

    async get(id: string): Promise<Tags.Type> {
        return await this.tagsRepository.get(id);
    }

    async list(organizationId: string): Promise<Tags.Type[]> {
        return await this.tagsRepository.list(organizationId);
    }
}