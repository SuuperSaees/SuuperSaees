import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

if (!process.env.NEXT_PUBLIC_LANDING_URL) {
  throw new Error("Redirect URL is not in environment variables");
}

const landing_page = process.env.NEXT_PUBLIC_LANDING_URL;

export function useSignOut() {
  const client = useSupabase();

  return useMutation({
    mutationFn: async () => {
      await client.auth.signOut();
      window.location.href = landing_page;
    },
    onError: (error) => {
      console.error('Error al cerrar sesión:', error.message);
    }
  });
}