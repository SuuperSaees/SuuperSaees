import { Tags } from '~/lib/tags.types';

export interface ITagsAction {
    /*
    * CRUD Operations
    */

    /*
    * Create
    */
    create: (payload: Tags.Insert) => Promise<void>;

    /*
    * Update
    */
    update: (payload: Tags.Update) => Promise<void>;

    /*
    * Delete
    */
    delete: (id: string) => Promise<void>;

    /*
    * Get
    */
    get: (id: string) => Promise<Tags.Type>;

    /*
    * List
    */
    list: (organizationId: string) => Promise<Tags.Type[]>;
}