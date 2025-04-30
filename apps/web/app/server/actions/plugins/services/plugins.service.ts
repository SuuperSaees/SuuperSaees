import { IPluginsService } from "./plugins.service.interface";
import { PluginsRepository } from "../repositories/plugins.repository";
import { Plugin, PluginInsert } from "~/lib/plugins.types";

export class PluginsService implements IPluginsService {
    constructor(private readonly pluginsRepository: PluginsRepository) {}

    async create(payload: PluginInsert, image: File | null): Promise<Plugin> {
        return await this.pluginsRepository.create(payload, image);
    }

    async update(id: string, payload: Partial<PluginInsert>, image: File | null): Promise<Plugin> {
        return await this.pluginsRepository.update(id, payload, image);
    }

    async delete(id: string): Promise<void> {
        return await this.pluginsRepository.delete(id);
    }

    async get(id: string): Promise<Plugin | null> {
        return await this.pluginsRepository.get(id);
    }

    async list(userId?: string): Promise<Plugin[]> {
        return await this.pluginsRepository.list(userId);
    }
}
