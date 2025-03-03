'use server';

import { createSubdomainsAction } from './subdomains';
import { Subdomain } from '~/lib/subdomain.types';

function getSubdomainsAction() {
    return createSubdomainsAction(process.env.NEXT_PUBLIC_SITE_URL as string);
}

export async function createSubdomain(payload: Subdomain.Insert): Promise<Subdomain.Type> {
    const subdomainsAction = getSubdomainsAction();
    return await subdomainsAction.create(payload);
}

export async function updateSubdomain(payload: Subdomain.Update, organizationId?: string): Promise<Subdomain.Type> {
    const subdomainsAction = getSubdomainsAction();
    return await subdomainsAction.update(payload, organizationId);
}

export async function deleteSubdomain(id: string): Promise<void> {
    const subdomainsAction = getSubdomainsAction();
    return await subdomainsAction.delete(id);
}


export async function getSubdomain(ids: string[]): Promise<Subdomain.Type[]> {
    const subdomainsAction = getSubdomainsAction();
    return await subdomainsAction.get(ids);
}



