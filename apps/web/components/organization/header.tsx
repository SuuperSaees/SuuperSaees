'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Trans } from '@kit/ui/trans';
import { updateOrganization } from '../../../../packages/features/team-accounts/src/server/actions/organizations/update/update-organizations';
import EditableHeader from '../editable-header';

interface OrganizationHeaderProps {
  name: string;
  id: string;
  currentUserRole: string;
  logo?: string;
  owner: {
    id: string;
    name: string;
    email?: string | null;
    picture_url?: string;
  };
}

function Header({ name, logo, owner, id, currentUserRole }: OrganizationHeaderProps) {
  const rolesThatCanEdit = new Set(['agency_member', 'agency_project_manager', 'agency_owner']);
  const ownerUserId = owner.id;
  return (
    <div className="flex w-full gap-4">
      <Avatar className="aspect-square h-16 w-16">
        {!logo ? (
          <AvatarFallback className="text-bold text-lg">
            {name
              .split(' ')
              .map((word) => word[0])
              .join('')}
          </AvatarFallback>
        ) : (
          <AvatarImage src={logo} alt={`${name} logo`} />
        )}
      </Avatar>
      <div className="flex flex-col gap-1">
        <EditableHeader
          initialName={name}
          id={id}
          userRole={currentUserRole}
          updateFunction={async (id, data) => {
            await updateOrganization(id as string, ownerUserId, data);
          }}
          rolesThatCanEdit={rolesThatCanEdit}
          label="Organization name"
          fieldName="name"
        />
        <p className="text-sm text-gray-600">
          <Trans i18nKey={'clients:organizations.members.owner'} />
          {': '}
          {owner.email}
        </p>
      </div>
    </div>
  );
}

export default Header;