import { Tags } from '~/lib/tags.types';
import { BaseAction } from '../base-action';
import { ITagsAction } from './tags.interface';
import { TagsController } from './controllers/tags.controller';


class TagsAction extends BaseAction implements ITagsAction {
    private controller: TagsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new TagsController(this.baseUrl, this.client, this.adminClient);
    }

    async create(payload: Tags.Insert): Promise<void> {
        return await this.controller.create(payload);
    }

    async update(payload: Tags.Update): Promise<void> {
        return await this.controller.update(payload);
    }

    async delete(id: string): Promise<void> {
        return await this.controller.delete(id);
    }

    async get(id: string): Promise<Tags.Type> {
        return await this.controller.get(id);
    }

    async list(organizationId: string): Promise<Tags.Type[]> {
        return await this.controller.list(organizationId);
    }
}

export function createTagsAction(baseUrl: string) {
    return new TagsAction(baseUrl);
}
