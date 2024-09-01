import { useQuery } from '@tanstack/react-query';



import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { LoadingOverlay } from '@kit/ui/loading-overlay';

import { getUserRole } from '../../server/actions/members/get/get-member-account';


export function RolesDataProvider(props: {
  maxRoleHierarchy: number;
  children: (roles: string[]) => React.ReactNode;
}) {
  const rolesQuery = useFetchRoles(props);

  if (rolesQuery.isLoading || rolesQuery.isPending) {
    return <LoadingOverlay fullPage={false} />;
  }

  if (rolesQuery.isError) {
    return null;
  }

  return <>{props.children(rolesQuery.data ?? [])}</>;
}

function useFetchRoles(props: { maxRoleHierarchy: number }) {
  const supabase = useSupabase();

  const { data: userRole } = useQuery({
    queryKey: ['userRole'],
    queryFn: async ()=> await getUserRole(),
  });


  return useQuery({
    queryKey: ['roles', props.maxRoleHierarchy],
    queryFn: async () => {
      const { error, data } = await supabase
        .from('roles')
        .select('name')
        .gte('hierarchy_level', props.maxRoleHierarchy)
        .order('hierarchy_level', { ascending: true })
     

      if (error) {
        throw error;
      }

      return data.map((item) => item.name)
      .filter((role) => role.includes(userRole?.split('_')[0] ?? ''));
    },
    enabled: !!userRole,
  });
}