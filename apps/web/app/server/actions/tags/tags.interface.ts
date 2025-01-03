import { Tags } from '~/lib/tags.types';

export interface ITagsAction {
    create: (payload: Tags.Insert) => Promise<void>;
    update: (payload: Tags.Update) => Promise<void>;
    delete: (id: string) => Promise<void>;
    get: (id: string) => Promise<Tags.Type>;
    list: (organizationId: string) => Promise<Tags.Type[]>;
}