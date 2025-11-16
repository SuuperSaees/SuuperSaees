import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/lib/database.types';
import { Plugin, PluginInsert } from '~/lib/plugins.types'; 
export class PluginsRepository {
    private client: SupabaseClient<Database>
    private adminClient?: SupabaseClient<Database>
    private readonly bucketName = 'plugins';

    constructor(client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.client = client;
        this.adminClient = adminClient;
    }

      /**
   * @name uploadImage
   * @description Uploads an image to the Supabase storage bucket and returns the public URL.
   * @param {File} image - The image file to be uploaded.
   * @param {string} pluginId - The unique ID of the plugin (used to name the file).
   * @returns {Promise<string | null>} The public URL of the uploaded image, or null if no image is provided.
   * @throws {Error} If the upload fails.
   */

    private async uploadImage(
        image: File | null,
        pluginId: string,
    ): Promise<string | null> {
        if (!image) return null;

        const fileName = `${pluginId}/${image.name}`;
        const { error } = await this.client.storage
            .from(this.bucketName)
            .upload(fileName, image, {
                cacheControl: '3600',
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = this.client.storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }

    
  /**
   * @name create
   * @description Inserts a new plugin into the 'plugins' table and optionally uploads an image.
   * @param {PluginInsert} plugin - The plugin data to be inserted.
   * @param {File | null} image - The optional image file to be uploaded.
   * @returns {Promise<Plugin>} The inserted plugin data with the image URL if provided.
   * @throws {Error} If the insert or image upload operation fails.
   */

    async create(payload: PluginInsert, image: File | null): Promise<Plugin> {
        const pluginId = crypto.randomUUID();
        const imageUrl = image ? await this.uploadImage(image, pluginId) : null;

        const { data: pluginData, error: pluginError } = await this.client
            .from('plugins')
            .insert({
                ...payload,
                id: pluginId,
                icon_url: imageUrl,
            })
            .select()
            .single();

        if (pluginError) throw pluginError;
        return pluginData as Plugin;
    }

    
  /**
   * @name update
   * @description Updates the details of an existing plugin in the 'plugins' table.
   * Ensures the plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the plugin to update.
   * @param {Partial<PluginInsert>} updates - The fields to update in the plugin.
   * @param {File | null} image - The optional new image file to upload.
   * @returns {Promise<Plugin>} The updated plugin data.
   * @throws {Error} If the update or image upload operation fails.
   */

    async update(id: string, payload: Partial<PluginInsert>, image: File | null): Promise<Plugin> {
        const imageUrl = image ? await this.uploadImage(image, id) : null;

        const { data: pluginData, error: pluginError } = await this.client
            .from('plugins')
            .update({
                ...payload,
                ...(imageUrl && { icon_url: imageUrl }),
            })
            .eq('id', id)
            .is('deleted_on', null)
            .select()
            .single();

        if (pluginError) throw pluginError;
        return pluginData as Plugin;
    }

    async delete(id: string): Promise<void> {
        const { error: pluginError } = await this.client
            .from('plugins')
            .update({
                deleted_on: new Date().toISOString(),
            })
            .eq('id', id);

        if (pluginError) throw pluginError;
    }

      /**
   * @name getById
   * @description Fetches a plugin by its unique ID from the 'plugins' table.
   * Ensures the plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the plugin to fetch.
   * @returns {Promise<Plugin | null>} The plugin data or null if not found.
   * @throws {Error} If the fetch operation fails.
   */

    async get(id: string): Promise<Plugin | null> {
        const { data: pluginData, error: pluginError } = await this.client
            .from('plugins')
            .select('*')
            .eq('id', id)
            .is('deleted_on', null)
            .single();

        if (pluginError) throw pluginError;
        return pluginData as Plugin;
    }

    
  /**
   * @name list
   * @description Fetches all plugins from the 'plugins' table.
   * Ensures plugins are not marked as deleted.
   * @returns {Promise<Plugin[]>} A list of all plugins.
   * @throws {Error} If the fetch operation fails.
   */

    async list(userId?: string): Promise<Plugin[]> {
        const { data: pluginData, error: pluginError } = await this.client
            .from('plugins')
            .select('*')
            .is('deleted_on', null);

        if (pluginError) throw pluginError;

        return pluginData.filter((plugin) => {
            if (userId && plugin.type === 'internal' && (plugin?.metadata as { users: string[] })?.users) {
                return (plugin.metadata as { users: string[] }).users?.includes(userId);
            }
            return true;
        }) as Plugin[];
    }
}
