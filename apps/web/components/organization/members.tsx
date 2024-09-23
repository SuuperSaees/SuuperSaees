'use client';

import { Dispatch, SetStateAction } from 'react';

import { useQuery } from '@tanstack/react-query';
import { getClientMembers } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

import { ClientsTable } from './clients-table';

function MemberSection({
  search,
  setSearch,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}) {
  const clientsWithOrganizations =
    useQuery({
      queryKey: ['clientsWithOrganizations'],
      queryFn: async () => await getClientMembers(),
    }) ?? [];
  console.log('cc', clientsWithOrganizations.data);

  if (!clientsWithOrganizations.data) return null;

  return (
    <>
      {clientsWithOrganizations.isLoading ||
      clientsWithOrganizations.isPending ? (
        <p>No clients available</p>
      ) : (
        <ClientsTable
          members={clientsWithOrganizations.data}
          searchController={{
            search,
            setSearch,
          }}
        />
      )}
    </>
  );
}
export default MemberSection;