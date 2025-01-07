import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

import { Plugin, PluginInsert } from '../../types';

/**
 * @name PluginRepository
 * @description Repository to handle database operations for plugins.
 * Interacts with the 'plugins' table and Supabase storage for image uploads.
 */
export class PluginRepository {
  private readonly tableName = 'plugins';
  private readonly bucketName = 'plugins';

  constructor(private client: SupabaseClient<Database>) {}

  /**
   * @name uploadImage
   * @description Uploads an image to the Supabase storage bucket and returns the public URL.
   * @param {File} image - The image file to be uploaded.
   * @param {string} pluginId - The unique ID of the plugin (used to name the file).
   * @returns {Promise<string | null>} The public URL of the uploaded image, or null if no image is provided.
   * @throws {Error} If the upload fails.
   */
  async uploadImage(
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

    if (error) {
      throw new Error(`Error uploading image: ${error.message}`);
    }

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
  async create(plugin: PluginInsert, image: File | null): Promise<Plugin> {
    const pluginId = crypto.randomUUID();
    let imageUrl: string | null = null;

    if (image) {
      imageUrl = await this.uploadImage(image, pluginId);
    }

    const { data, error } = await this.client
      .from(this.tableName)
      .insert({
        ...plugin,
        id: pluginId,
        icon_url: imageUrl,
      })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error creating plugin: ${error.message}`);
    }

    return data as Plugin;
  }

  /**
   * @name getById
   * @description Fetches a plugin by its unique ID from the 'plugins' table.
   * Ensures the plugin has not been marked as deleted.
   * @param {string} id - The unique ID of the plugin to fetch.
   * @returns {Promise<Plugin | null>} The plugin data or null if not found.
   * @throws {Error} If the fetch operation fails.
   */
  async getById(id: string): Promise<Plugin | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .is('deleted_on', null)
      .single();

    if (error) {
      throw new Error(`Error fetching plugin by ID: ${error.message}`);
    }

    return data as Plugin;
  }

  /**
   * @name getAll
   * @description Fetches all plugins from the 'plugins' table.
   * Ensures plugins are not marked as deleted.
   * @returns {Promise<Plugin[]>} A list of all plugins.
   * @throws {Error} If the fetch operation fails.
   */
  async getAll(): Promise<Plugin[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .is('deleted_on', null);

    if (error) {
      throw new Error(`Error fetching all plugins: ${error.message}`);
    }

    return data as Plugin[];
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
  async update(
    id: string,
    updates: Partial<PluginInsert>,
    image: File | null,
  ): Promise<Plugin> {
    let imageUrl: string | null = null;

    if (image) {
      imageUrl = await this.uploadImage(image, id);
    }

    const { data, error } = await this.client
      .from(this.tableName)
      .update({
        ...updates,
        ...(imageUrl && { icon_url: imageUrl }),
      })
      .eq('id', id)
      .is('deleted_on', null)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Error updating plugin: ${error.message}`);
    }

    return data as Plugin;
  }

  /**
   * @name delete
   * @description Marks a plugin as deleted by updating its 'deleted_on' field in the 'plugins' table.
   * This performs a soft delete, meaning the record is not removed from the database but marked as deleted.
   * @param {string} id - The unique ID of the plugin to delete.
   * @returns {Promise<void>} Resolves when the plugin is successfully marked as deleted.
   * @throws {Error} If the delete operation fails (e.g., database error or plugin ID not found).
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .update({ deleted_on: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting plugin: ${error.message}`);
    }
  }
}
