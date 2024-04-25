import 'server-only';

import { redirect } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { z } from 'zod';

import { verifyCaptchaToken } from '@kit/auth/captcha/server';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { captureException, zodParseFactory } from '../utils';

/**
 *
 * @name enhanceAction
 * @description Enhance an action with captcha, schema and auth checks
 */
export function enhanceAction<
  Args,
  Schema extends z.ZodType<Omit<Args, 'captchaToken'>, z.ZodTypeDef>,
  Response,
>(
  fn: (params: z.infer<Schema>, user: User) => Response | Promise<Response>,
  config: {
    captcha?: boolean;
    captureException?: boolean;
    schema: Schema;
  },
) {
  return async (
    params: z.infer<Schema> & {
      captchaToken?: string;
    },
  ) => {
    // verify the user is authenticated if required
    const auth = await requireUser(getSupabaseServerActionClient());

    // If the user is not authenticated, redirect to the specified URL.
    if (!auth.data) {
      redirect(auth.redirectTo);
    }

    // verify the captcha token if required
    if (config.captcha) {
      const token = z.string().min(1).parse(params.captchaToken);

      await verifyCaptchaToken(token);
    }

    // validate the schema
    const parsed = zodParseFactory(config.schema);
    const data = parsed(params);

    // capture exceptions if required
    const shouldCaptureException = config.captureException ?? true;

    if (shouldCaptureException) {
      try {
        return await fn(data, auth.data);
      } catch (error) {
        await captureException(error);

        throw error;
      }
    } else {
      // pass the data to the action
      return fn(data, auth.data);
    }
  };
}
