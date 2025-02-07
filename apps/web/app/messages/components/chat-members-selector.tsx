'use client';

import { useQuery } from '@tanstack/react-query';

import { Members } from '~/lib/members.types';
import { getTeams } from '~/server/actions/team/team.action';

import OrganizationsMembersDropdownMenu from './organizations-members-dropdown-menu';

// import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface ChatMembersSelectorProps {
  agencyTeam: Members.Organization;
  selectedMembers: string[];
  onMembersUpdate: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatMembersSelector({
  agencyTeam,
  selectedMembers, // This include both members selected from the agency and the client organizations
  onMembersUpdate,
  isLoading = false,
}: ChatMembersSelectorProps) {
  const agencyMembers = agencyTeam.members ?? [];

  const clientOrganizationIds = agencyTeam.members
    ?.map((member) => member.organization_id)
    .filter((id) => id !== agencyTeam.id);

  const clientMembersQuery = useQuery({
    queryKey: ['clientMembers', clientOrganizationIds],
    queryFn: () =>
      getTeams({
        organizationIds: clientOrganizationIds ?? [],
        includeMembers: true,
      }),
    enabled: !!clientOrganizationIds,
  });

  const clientOrganizationMembers = clientMembersQuery.data ?? {};
  const clientMembers =
    Object.values(clientOrganizationMembers).flatMap(
      (team) => team?.members ?? [],
    ) ?? [];

  const selectedAgencyMembers =
    agencyMembers.filter((member) => selectedMembers.includes(member.id)) ?? [];
  const selectedClientOrganizationMembers =
    clientMembers.filter((member) => selectedMembers.includes(member.id)) ?? [];

  console.log('selected members', selectedMembers);
  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 px-1">
      {/* Mostrar avatares de miembros seleccionados */}

      {/* Checkbox Combobox para seleccionar miembros */}
      {!clientMembersQuery.isLoading && (
        <OrganizationsMembersDropdownMenu
          agencyMembers={agencyMembers}
          clientOrganizationMembers={clientMembers}
          selectedAgencyMembers={selectedAgencyMembers}
          selectedClientOrganizationMembers={selectedClientOrganizationMembers}
          onMembersUpdate={onMembersUpdate}
          isLoading={isLoading}
        />
      )}

      {/* {!isLoading && (
        <MembersAssignations
          users={teams.members}
          defaultSelectedUsers={selectedMembersDetails}
          updateOrderUsersFn={onMembersUpdate}
          isLoading={isLoading}
        />
      )} */}
    </div>
  );
}
