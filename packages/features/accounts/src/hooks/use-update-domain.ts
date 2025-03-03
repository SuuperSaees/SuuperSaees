import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDomainByOrganizationId } from '../../../../multitenancy/utils/get/get-domain';
import { updateSubdomain } from '../../../../../apps/web/app/server/actions/subdomains/subdomains.action';

interface UpdateData {
  domain: string;
}

export function useUpdateDomain(organizationId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['account:domain', organizationId];

  // Query para obtener el dominio actual
  const domainQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await getDomainByOrganizationId(organizationId, false, true);
      return response;
    },
    enabled: !!organizationId,
  });

  // Mutation para actualizar el dominio
  const updateDomainMutation = useMutation({
    mutationFn: async (data: UpdateData) => {
      try {
        await updateSubdomain({
          domain: data.domain,
        }, organizationId); 
      } catch (error) {
        console.error('Error updating domain');
        throw error;
      }
    },
    onSuccess: () => {
     void queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    domain: domainQuery.data,
    isLoading: domainQuery.isLoading,
    updateDomain: updateDomainMutation.mutate,
    isUpdating: updateDomainMutation.isPending,
  };
}

  


