import 'server-only';

import { cookies } from 'next/headers';

import type { CookieOptions } from '@supabase/ssr';
import { createServerClient } from '@supabase/ssr';

import { Database } from '../database.types';
import {
  getServiceRoleKey,
  warnServiceRoleKeyUsage,
} from '../get-service-role-key';
import { getSupabaseClientKeys } from '../get-supabase-client-keys';

const serviceRoleKey = getServiceRoleKey();
const keys = getSupabaseClientKeys();

/**
 * @name getSupabaseRouteHandlerClient
 * @description Get a Supabase client for use in the Route Handler Routes
 */
export function getSupabaseRouteHandlerClient<GenericSchema = Database>(
  params = {
    admin: false,
  },
) {
  if (params.admin) {
    warnServiceRoleKeyUsage();

    return createServerClient<GenericSchema>(keys.url, serviceRoleKey, {
      auth: {
        persistSession: false,
      },
      cookies: {},
    });
  }

  return createServerClient<GenericSchema>(keys.url, keys.anonKey, {
    cookies: getCookiesStrategy(),
  });
}

function getCookiesStrategy() {
  const cookieStore = cookies();

  return {
    set: (name: string, value: string, options: CookieOptions) => {
      cookieStore.set({ name, value, ...options });
    },
    get: (name: string) => {
      return cookieStore.get(name)?.value;
    },
    remove: (name: string, options: CookieOptions) => {
      cookieStore.set({ name, value: '', ...options });
    },
  };
}
