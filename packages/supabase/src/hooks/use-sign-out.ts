import { useRouter } from 'next/navigation';

import { useMutation } from '@tanstack/react-query';

import { getDomainByUserId } from '../../../multitenancy/utils/get/get-domain';
import { useSupabase } from './use-supabase';

// Check if the site URL is defined in environment variables
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Redirect URL is not in environment variables');
}

// Define the default landing page URL
const landingPage = `${process.env.NEXT_PUBLIC_SITE_URL}auth/sign-in`;

export function useSignOut() {
  const client = useSupabase();
  const router = useRouter();
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

  return useMutation({
    mutationFn: async () => {
      try {
        // Fetch the current user data
        const { data: userData, error: userError } =
          await client.auth.getUser();
        if (userError)
          throw new Error(`Error fetching user: ${userError.message}`);

        const userId = userData?.user?.id;

        // Get the domain for the user (for multi-tenancy support)
        const domain = await getDomainByUserId(userId, false);

        // Determine the appropriate landing page URL
        const landingPageParsed = IS_PROD
          ? `https://${domain}/auth/sign-in`
          : landingPage;

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
