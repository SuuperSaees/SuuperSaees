'use server';

import { createPluginsAction } from "./plugins";
import { PluginInsert } from "~/lib/plugins.types";

function getPluginsActions() {
    return createPluginsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export const createPlugin = async (pluginData: PluginInsert, image: File | null) => {
    return await getPluginsActions().create(pluginData, image);
}

export const updatePlugin = async (id: string, payload: Partial<PluginInsert>, image: File | null) => {
    return await getPluginsActions().update(id, payload, image);
}

export const deletePlugin = async (id: string) => {
    return await getPluginsActions().delete(id);
}

export const getPlugin = async (id: string) => {
    return await getPluginsActions().get(id);
}

export const getPlugins = async (userId?: string) => {
    return await getPluginsActions().list(userId);
}
