'use client'; 

import { useCallback, useEffect } from 'react';

import { useSignOut } from '@kit/supabase/hooks/use-sign-out';

import { deleteToken } from '~/team-accounts/src/server/actions/tokens/delete/delete-token';

interface UseOrdersAuthManagementProps {
  hasOrders: boolean;
  role: string;
}
const useOrdersAuthManagement = ({
  role,
  hasOrders,
}: UseOrdersAuthManagementProps) => {
  const signOut = useSignOut();

  const handleSignOut = useCallback(async () => {
    const impersonatingTokenId = localStorage.getItem('impersonatingTokenId');
    if (impersonatingTokenId) {
      localStorage.removeItem('impersonatingTokenId');
      await deleteToken(impersonatingTokenId);
    }
    await signOut.mutateAsync();
  }, [signOut]);

  useEffect(() => {
    if (role === 'client_guest' && hasOrders) {
      void handleSignOut();
    }
  }, [handleSignOut, hasOrders, role]);

  return {
    handleSignOut,
  };
};

export default useOrdersAuthManagement;
