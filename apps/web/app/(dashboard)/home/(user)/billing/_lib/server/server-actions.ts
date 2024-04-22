'use server';

import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { PersonalAccountCheckoutSchema } from '../schema/personal-account-checkout.schema';
import { UserBillingService } from './user-billing.service';

/**
 * @name createPersonalAccountCheckoutSession
 * @description Creates a checkout session for a personal account.
 */
export const createPersonalAccountCheckoutSession = enhanceAction(
  async function (data) {
    const service = new UserBillingService(getSupabaseServerActionClient());

    return await service.createCheckoutSession(data);
  },
  {
    schema: PersonalAccountCheckoutSchema,
  },
);

/**
 * @description Creates a billing Portal session for a personal account
 */
export async function createPersonalAccountBillingPortalSession() {
  const service = new UserBillingService(getSupabaseServerActionClient());
  const url = await service.createBillingPortalSession();

  return redirect(url);
}
