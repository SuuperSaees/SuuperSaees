import { Plugin, PluginInsert } from "~/lib/plugins.types";

export interface IPluginsAction {
    list(): Promise<Plugin[]>;
    create(payload: PluginInsert, image: File | null): Promise<Plugin>;
    update(id: string, payload: Partial<PluginInsert>, image: File | null): Promise<Plugin>;
    delete(id: string): Promise<void>;
    get(id: string): Promise<Plugin | null>;
}
