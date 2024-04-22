'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { z } from 'zod';

import { getLogger } from '@kit/shared/logger';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { DeletePersonalAccountSchema } from '../schema/delete-personal-account.schema';
import { createDeletePersonalAccountService } from './services/delete-personal-account.service';

const emailSettings = getEmailSettingsFromEnvironment();

export async function refreshAuthSession() {
  const client = getSupabaseServerActionClient();

  await client.auth.refreshSession();

  return {};
}

export async function deletePersonalAccountAction(formData: FormData) {
  // validate the form data
  const { success } = DeletePersonalAccountSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!success) {
    throw new Error('Invalid form data');
  }

  const client = getSupabaseServerActionClient();
  const auth = await requireUser(client);

  if (auth.error) {
    const logger = await getLogger();

    logger.error(
      {
        error: auth.error,
      },
      `User is not authenticated. Redirecting to login page.`,
    );

    redirect(auth.redirectTo);
  }

  // retrieve user ID and email
  const userId = auth.data.id;
  const userEmail = auth.data.email ?? null;

  // create a new instance of the personal accounts service
  const service = createDeletePersonalAccountService();

  // delete the user's account and cancel all subscriptions
  await service.deletePersonalAccount({
    adminClient: getSupabaseServerActionClient({ admin: true }),
    userId,
    userEmail,
    emailSettings,
  });

  // sign out the user after deleting their account
  await client.auth.signOut();

  // clear the cache for all pages
  revalidatePath('/', 'layout');

  // redirect to the home page
  redirect('/');
}

function getEmailSettingsFromEnvironment() {
  return z
    .object({
      fromEmail: z
        .string({
          required_error: 'Provide the variable EMAIL_SENDER',
        })
        .email(),
      productName: z
        .string({
          required_error: 'Provide the variable NEXT_PUBLIC_PRODUCT_NAME',
        })
        .min(1),
    })
    .parse({
      fromEmail: process.env.EMAIL_SENDER,
      productName: process.env.NEXT_PUBLIC_PRODUCT_NAME,
    });
}
