import { useMutation } from '@tanstack/react-query';

import { Database } from '@kit/supabase/database';

// import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { updateUserSettings } from '../../../team-accounts/src/server/actions/members/update/update-account';

type UpdateData = Database['public']['Tables']['accounts']['Update'];

export function useUpdateAccountData(accountId: string) {
  // const client = useSupabase();

  const mutationKey = ['account:data', accountId];

  const mutationFn = async (data: UpdateData) => {
    // const response = await client.from('accounts').update(data).match({
    //   id: accountId,
    // });
    try {
      const response = await updateUserSettings(accountId, {
        name: data.name,
      });

      return response;
    } catch (error) {
      console.error('Error updating account data');
      throw error;
    }
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
