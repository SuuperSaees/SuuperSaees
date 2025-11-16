import { Plugin, PluginInsert } from "~/lib/plugins.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "~/lib/database.types";
import { PluginsRepository } from "../repositories/plugins.repository";
import { PluginsService } from "../services/plugins.service";


export class PluginsController {
    private baseUrl: string;
    private client: SupabaseClient<Database>;
    private adminClient?: SupabaseClient<Database>;

    constructor(baseUrl: string, client: SupabaseClient<Database>, adminClient?: SupabaseClient<Database>) {
        this.baseUrl = baseUrl;
        this.client = client;
        this.adminClient = adminClient;
    }

    async list(userId?: string): Promise<Plugin[]> {
        try {
            const pluginRepository = new PluginsRepository(this.client, this.adminClient);
            const pluginService = new PluginsService(pluginRepository);
            return await pluginService.list(userId);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async create(payload: PluginInsert, image: File | null): Promise<Plugin> {
        try {
            const pluginRepository = new PluginsRepository(this.client, this.adminClient);
            const pluginService = new PluginsService(pluginRepository);
            return await pluginService.create(payload, image);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async update(id: string, payload: Partial<PluginInsert>, image: File | null): Promise<Plugin> {
        try {
            const pluginRepository = new PluginsRepository(this.client, this.adminClient);
            const pluginService = new PluginsService(pluginRepository);
            return await pluginService.update(id, payload, image);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async delete(id: string): Promise<void> {
        try {
            const pluginRepository = new PluginsRepository(this.client, this.adminClient);
            const pluginService = new PluginsService(pluginRepository);
            return await pluginService.delete(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
    async get(id: string): Promise<Plugin | null> {
        try {
            const pluginRepository = new PluginsRepository(this.client, this.adminClient);
            const pluginService = new PluginsService(pluginRepository);
            return await pluginService.get(id);
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
