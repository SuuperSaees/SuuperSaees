import { Tags } from '~/lib/tags.types';

export interface ITagsAction {
    /*
    * CRUD Operations
    */

    /*
    * Create
    */
    create: (payload: Tags.Insert, orderId?: number) => Promise<Tags.Type>;

    /*
    * Update
    */
    update: (payload: Tags.Update) => Promise<Tags.Type>;

    /*
    * Delete
    */
    delete: (id: string) => Promise<void>;

    /*
    * Get
    */
    get: (ids: string[]) => Promise<Tags.Type[]>;

    /*
    * List
    */
    list: (organizationId: string, orderId?: number) => Promise<Tags.Type[]>;
}