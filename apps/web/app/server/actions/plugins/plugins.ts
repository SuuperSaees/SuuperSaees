import { BaseAction } from "../base-action";
import { PluginsController } from "./controllers/plugins.controller";
import {Plugin,  PluginInsert } from "~/lib/plugins.types";
import { IPluginsAction } from "./plugins.interface";

class PluginsAction extends BaseAction implements IPluginsAction {
    private controller: PluginsController;
    constructor(baseUrl: string) {
        super(baseUrl);
        this.controller = new PluginsController(this.baseUrl, this.client, this.adminClient);
    }

    async list(userId?: string): Promise<Plugin[]> {
        return await this.controller.list(userId);
    }

    async create(payload: PluginInsert, image: File | null): Promise<Plugin> {
        return await this.controller.create(payload, image);
    }

    async update(id: string, payload: Partial<PluginInsert>, image: File | null): Promise<Plugin> {
        return await this.controller.update(id, payload, image);
    }

    async delete(id: string): Promise<void> {
        return await this.controller.delete(id);
    }

    async get(id: string): Promise<Plugin | null> {
        return await this.controller.get(id);
    }
}

export function createPluginsAction(baseUrl: string) {
    return new PluginsAction(baseUrl);
}