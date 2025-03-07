'use server';

import { createEmbedsAction } from "./embeds";
import { Embeds } from "~/lib/embeds.types";

function getEmbedAction() {
    return createEmbedsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function getEmbed(embedId: string) {
    const embedAction = getEmbedAction();
    return await embedAction.get(embedId);
}

export async function createEmbed(embed: Embeds.Insert, accountIds?: string[]) {
    const embedAction = getEmbedAction();
    return await embedAction.create(embed, accountIds);
}

export async function updateEmbed(embedId: string, embed: Embeds.Update, accountIds?: string[]) {
    const embedAction = getEmbedAction();
    return await embedAction.update(embedId, embed, accountIds);
}

export async function deleteEmbed(embedId: string) {
    const embedAction = getEmbedAction();
    return await embedAction.delete(embedId);
}

export async function getEmbeds(organizationId?: string) {
    const embedAction = getEmbedAction();
    return await embedAction.list(organizationId);
}
