import 'server-only';

import { redirect } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { ZodType, z } from 'zod';

import { verifyCaptchaToken } from '@kit/auth/captcha/server';
import { requireUser } from '@kit/supabase/require-user';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { captureException, zodParseFactory } from '../utils';

/**
 * @name IS_CAPTCHA_SETUP
 * @description Check if the CAPTCHA is setup
 */
const IS_CAPTCHA_SETUP = !!process.env.CAPTCHA_SECRET_TOKEN;

/**
 *
 * @name enhanceAction
 * @description Enhance an action with captcha, schema and auth checks
 */
export function enhanceAction<
  Args,
  Response,
  Config extends {
    auth?: boolean;
    captcha?: boolean;
    captureException?: boolean;
    schema?: z.ZodType<
      Config['captcha'] extends true ? Args & { captchaToken: string } : Args,
      z.ZodTypeDef
    >;
  },
>(
  fn: (
    params: Config['schema'] extends ZodType ? z.infer<Config['schema']> : Args,
    user: Config['auth'] extends false ? undefined : User,
  ) => Response | Promise<Response>,
  config: Config,
) {
  return async (
    params: Config['schema'] extends ZodType ? z.infer<Config['schema']> : Args,
  ) => {
    type UserParam = Config['auth'] extends false ? undefined : User;

    const requireAuth = config.auth ?? true;

    let user: UserParam = undefined as UserParam;

    if (requireAuth) {
      // verify the user is authenticated if required
      const auth = await requireUser(getSupabaseServerActionClient());

      // If the user is not authenticated, redirect to the specified URL.
      if (!auth.data) {
        redirect(auth.redirectTo);
      }

      user = auth.data as UserParam;
    }

    // validate the schema
    const data = config.schema
      ? zodParseFactory(config.schema)(params)
      : params;

    // verify captcha unless it's explicitly disabled
    // verify the captcha token if required
    const verifyCaptcha = config.captcha ?? IS_CAPTCHA_SETUP;

    if (verifyCaptcha) {
      const token = (data as Args & { captchaToken: string }).captchaToken;

      // Verify the CAPTCHA token. It will throw an error if the token is invalid.
      await verifyCaptchaToken(token);
    }

    // capture exceptions if required
    const shouldCaptureException = config.captureException ?? true;

    if (shouldCaptureException) {
      try {
        return await fn(data, user);
      } catch (error) {
        await captureException(error);

        throw error;
      }
    } else {
      // pass the data to the action
      return fn(data, user);
    }
  };
}
