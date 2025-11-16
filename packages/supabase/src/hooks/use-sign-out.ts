'use client';

import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

// Check if the site URL is defined in environment variables
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Redirect URL is not in environment variables');
}

// Define the default landing page URL

export function useSignOut() {
  const client = useSupabase();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      try {

        // Determine the appropriate landing page URL
        const domain = typeof window !== 'undefined' ? window.location.host : '';

        const landingPageParsed = domain.includes('localhost')
          ? `http://${domain}/auth/sign-in`
          : `https://${domain}/auth/sign-in`;

        // Sign out the user
        await client.auth.signOut();

        // Clear any local storage items
        localStorage.removeItem('internalMessagingEnabled');

        // Return the landing page URL for navigation
        return landingPageParsed;
      } catch (error) {
        console.error('Error during sign out process:', error);
        throw error;
      }
    },
    onSuccess: (landingPageParsed) => {
      // Navigate to the landing page after successful sign out
      router.push(landingPageParsed);
    },
    onError: (error: Error) => {
      console.error('Error during sign out process:', error.message);
      // You might want to add some user notification here
    },
  });
}
