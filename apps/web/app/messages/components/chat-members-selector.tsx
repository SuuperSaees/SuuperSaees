'use client';

import { Members } from '~/lib/members.types';

import OrganizationsMembersDropdownMenu from './organizations-members-dropdown-menu';
// import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

interface ChatMembersSelectorProps {
  teams: Members.Type;
  selectedMembers: string[];
  onMembersUpdate: (userIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export default function ChatMembersSelector({
  teams,
  selectedMembers,
  onMembersUpdate,
  isLoading = false,
}: ChatMembersSelectorProps) {
  // const { workspace: userWorkspace } = useUserWorkspace();
  // const agencyRoles = ['agency_owner', 'agency_project_manager', 'agency_member'];
  // // const clientRoles = ['client_owner', 'client_member'];
  // const role = userWorkspace.role ?? '';



  //   const isAgencyRole = agencyRoles.includes(role);
    // const isClientRole = clientRoles.includes(role);

    // // Get the current organization based on role
    // const currentOrganization = isAgencyRole 
    //   ? teams.organizations[0] // Agency org is first for agency roles
    //   : teams.organizations[1]; // Client org is second for client roles

    // Split members into agency and client based on their organization_id
    const agencyMembers = teams.members.filter(member => 
      member.organization_id === teams.organizations[0]?.id
    );

    const clientOrganizationMembers = teams.members.filter(member =>
      member.organization_id === teams.organizations[1]?.id  
    );

    // Get selected members details
    const selectedMembersDetails = teams.members.filter(member => 
      selectedMembers.includes(member.id)
    );

    const selectedAgencyMembers = selectedMembersDetails.filter(member =>
      member.organization_id === teams.organizations[0]?.id
    );

    const selectedClientOrganizationMembers = selectedMembersDetails.filter(member =>
      member.organization_id === teams.organizations[1]?.id
    );
    console.log('selectedAgencyMembers', selectedAgencyMembers, 'selectedClientOrganizationMembers', selectedClientOrganizationMembers);


  return (
    <div className="flex items-center gap-1 rounded-full border border-gray-200 px-1">
      {/* Mostrar avatares de miembros seleccionados */}

      {/* Checkbox Combobox para seleccionar miembros */}
      <OrganizationsMembersDropdownMenu
        agencyMembers={agencyMembers}
        clientOrganizationMembers={clientOrganizationMembers}
        selectedAgencyMembers={selectedAgencyMembers}
        selectedClientOrganizationMembers={selectedClientOrganizationMembers}
        onMembersUpdate={onMembersUpdate}
        isLoading={isLoading}


      />
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
