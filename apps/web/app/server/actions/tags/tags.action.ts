'use server';

import { createTagsAction } from "./tags";
import { Tags } from "~/lib/tags.types";
import { cache } from "react";

function getTagsAction() {
    return createTagsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createTag(payload: Tags.Insert, orderId?: number): Promise<Tags.Type> {
    const tagsAction = getTagsAction();
    return await tagsAction.create(payload, orderId);
}

export async function updateTag(payload: Tags.Update): Promise<Tags.Type> {
    const tagsAction = getTagsAction();
    return await tagsAction.update(payload);
}

export async function deleteTag(id: string): Promise<void> {
    const tagsAction = getTagsAction();
    return await tagsAction.delete(id);
}

export async function getTag(ids: string[]): Promise<Tags.Type[]> {
    const tagsAction = getTagsAction();
    return await tagsAction.get(ids);
}

export const getTags = cache(async (organizationId: string, orderId?: number): Promise<Tags.Type[]> => {
    const tagsAction = getTagsAction();
    return await tagsAction.list(organizationId, orderId);
});
