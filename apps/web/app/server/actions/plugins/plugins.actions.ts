'use server';

import { createPluginsAction } from "./plugins";
import { PluginInsert } from "~/lib/plugins.types";
export const pluginsActions = createPluginsAction('/api/plugins');

export const createPlugin = async (pluginData: PluginInsert, image: File | null) => {
    return await pluginsActions.create(pluginData, image);
}

export const updatePlugin = async (id: string, payload: Partial<PluginInsert>, image: File | null) => {
    return await pluginsActions.update(id, payload, image);
}

export const deletePlugin = async (id: string) => {
    return await pluginsActions.delete(id);
}

export const getPlugin = async (id: string) => {
    return await pluginsActions.get(id);
}

export const listPlugins = async () => {
    return await pluginsActions.list();
}
