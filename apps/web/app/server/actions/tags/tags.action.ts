'use server';

import { createTagsAction } from "./tags";
import { Tags } from "~/lib/tags.types";
export const tagsAction = createTagsAction(process.env.NEXT_PUBLIC_SITE_URL as string);

export async function createTag(payload: Tags.Insert): Promise<Tags.Type> {
    return await tagsAction.create(payload);
}

export async function updateTag(payload: Tags.Update): Promise<Tags.Type> {
    return await tagsAction.update(payload);
}

export async function deleteTag(id: string): Promise<void> {
    return await tagsAction.delete(id);
}

export async function getTag(id: string): Promise<Tags.Type> {
    return await tagsAction.get(id);
}

export async function listTags(organizationId: string): Promise<Tags.Type[]> {
    return await tagsAction.list(organizationId);
}
