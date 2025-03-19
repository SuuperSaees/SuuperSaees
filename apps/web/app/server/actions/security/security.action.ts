'use server';

import { createSecurityAction } from "./security";
import { Embeds } from "~/lib/embeds.types";
function getSecurityAction() {
    return createSecurityAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function sanitizeText(text: string): Promise<string> {
    const securityAction = getSecurityAction();
    return await securityAction.sanitizeText(text);
}

export async function validateEmbedData(data: Embeds.Insert | Embeds.Update): Promise<void> {
    const securityAction = getSecurityAction();
    return await securityAction.validateEmbedData(data);
}

export async function validateIframe(value: string): Promise<void> {
    const securityAction = getSecurityAction();
    return await securityAction.validateIframe(value);
}

export async function validateUrl(value: string): Promise<void> {
    const securityAction = getSecurityAction();
    return await securityAction.validateUrl(value);
}

export async function validateXssAttack(value: string): Promise<void> {
    const securityAction = getSecurityAction();
    return await securityAction.validateXssAttack(value);
}
