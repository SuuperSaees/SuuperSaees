import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

if (!process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error('Redirect URL is not in environment variables');
}

const landingPage = `${process.env.NEXT_PUBLIC_SITE_URL}auth/sign-in`;

export function useSignOut() {
  const client = useSupabase();
  const IS_PROD = process.env.NEXT_PUBLIC_IS_PROD === 'true';
  const ignoreRole = new Set(['client_owner', 'client_member']);
  return useMutation({
    mutationFn: async () => {
      try {
        const { data: userData, error: userError } =
          await client.auth.getUser();
        if (userError)
          throw new Error(`Error fetching user: ${userError.message}`);

        const userId = userData?.user?.id;
        const { data: accountData, error: accountError } = await client
          .from('accounts')
          .select('organization_id, accounts_memberships(account_role)')
          .eq('id', userId)
          .single();

        if (accountError)
          throw new Error(`Unauthorized: ${accountError.message}`);
        if (
          accountData?.accounts_memberships?.some((membership) =>
            ignoreRole.has(membership.account_role),
          )
        ) {
        const { data: domainsData, error: domainsError } = await client
          .from('organization_subdomains')
          .select('subdomains(domain)')
          .eq('organization_id', accountData?.organization_id ?? '')
          .single();

        if (domainsError)
          throw new Error(`Error fetching domains: ${domainsError.message}`);

        const landingPageParsed = IS_PROD
          ? `https://${domainsData?.subdomains?.domain}/auth/sign-in`
          : landingPage;

        await client.auth.signOut();
        localStorage.removeItem('internalMessagingEnabled');
        window.location.href = landingPageParsed;
        } else {
          const currentHost = window.location.origin;
          await client.auth.signOut();
          localStorage.removeItem('internalMessagingEnabled');
          window.location.href = `${currentHost}/auth/sign-in`;
        }
      } catch (error) {
        console.error('Error during sign out process:', error);
        throw error; // Re-throw the error to be caught by onError
      }
    },
    onError: (error: Error) => {
      console.error('Error al cerrar sesión:', error.message);
    },
  });
}
