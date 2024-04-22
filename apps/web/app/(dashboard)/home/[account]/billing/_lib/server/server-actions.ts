'use server';

import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

// billing imports
import {
  TeamBillingPortalSchema,
  TeamCheckoutSchema,
} from '../schema/team-billing.schema';
import { TeamBillingService } from './team-billing.service';

/**
 * @name createTeamAccountCheckoutSession
 * @description Creates a checkout session for a team account.
 */
export async function createTeamAccountCheckoutSession(
  params: z.infer<typeof TeamCheckoutSchema>,
) {
  const data = TeamCheckoutSchema.parse(params);
  const service = new TeamBillingService(getSupabaseServerActionClient());

  return service.createCheckout(data);
}

/**
 * @name createBillingPortalSession
 * @description Creates a Billing Session Portal and redirects the user to the
 * provider's hosted instance
 */
export async function createBillingPortalSession(formData: FormData) {
  const params = TeamBillingPortalSchema.parse(Object.fromEntries(formData));
  const service = new TeamBillingService(getSupabaseServerActionClient());

  // get url to billing portal
  const url = await service.createBillingPortalSession(params);

  return redirect(url);
}
