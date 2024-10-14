import { useMutation } from '@tanstack/react-query';



import { getDomainByUserId } from '../../../multitenancy/utils/get-domain-by-user-id';
import { useSupabase } from './use-supabase';

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Redirect URL is not in environment variables');
}

const landingPage = `${process.env.NEXT_PUBLIC_SITE_URL}auth/sign-in`;

export function useSignOut() {
  const client = useSupabase();
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';

  return useMutation({
    mutationFn: async () => {
      try {
        const { data: userData, error: userError } =
          await client.auth.getUser();
        if (userError)
          throw new Error(`Error fetching user: ${userError.message}`);

        const userId = userData?.user?.id;
        const domain = await getDomainByUserId(userId, false);
        const landingPageParsed = IS_PROD
          ? `https://${domain}/auth/sign-in`
          : landingPage;

        await client.auth.signOut();
        localStorage.removeItem('internalMessagingEnabled');
        window.location.href = landingPageParsed;
      } catch (error) {
        console.error('Error during sign out process:', error);
        throw error; // Re-throw the error to be caught by onError
      }
    },
    onError: (error: Error) => {
      console.error('Error during sign out process:', error.message);
    },
  });
}