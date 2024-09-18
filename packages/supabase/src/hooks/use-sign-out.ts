import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

export function useSignOut() {
  const client = useSupabase();

  return useMutation({
    mutationFn: async () => {
      await client.auth.signOut();
      // Redirige después de cerrar sesión
      window.location.href = 'https://suuper.co/';
    },
    onError: (error) => {
      console.error('Error al cerrar sesión:', error.message);
    }
  });
}
