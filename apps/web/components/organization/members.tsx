'use client';

import { Dispatch, SetStateAction } from 'react';



import { useQuery } from '@tanstack/react-query';
// import { getClientMembers } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';
import { getClientMembersForOrganization } from 'node_modules/@kit/team-accounts/src/server/actions/clients/get/get-clients';



import { ClientsTable } from './clients-table';


function MemberSection({
  search,
  setSearch,
  clientOrganizationId,
  currentUserRole,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  currentUserRole: string;
  clientOrganizationId?: string;
}) {
  const clientsWithOrganizations =
    useQuery({
      queryKey: ['clientsWithOrganizations', clientOrganizationId],
      queryFn: async () =>
        await getClientMembersForOrganization(clientOrganizationId ?? ''),
      staleTime: 0, // Ensure refetching
    }) ?? [];

  if (!clientsWithOrganizations.data) return null;

  return (
    <>
      {clientsWithOrganizations.isLoading ||
      clientsWithOrganizations.isPending ? (
        <p>No clients available</p>
      ) : (
        <ClientsTable
          members={clientsWithOrganizations.data}
          userRole={currentUserRole}
          searchController={{
            search,
            setSearch,
          }}
          queryKey='clientsWithOrganizations'
        />
      )}
    </>
  );
}
export default MemberSection;