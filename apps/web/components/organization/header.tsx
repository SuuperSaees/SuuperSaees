'use client';

import { UpdateAccountImageContainer } from 'node_modules/@kit/accounts/src/components/personal-account-settings/update-account-image-container';

import { Trans } from '@kit/ui/trans';
import { updateOrganization } from '../../../../packages/features/team-accounts/src/server/actions/organizations/update/update-organizations';
import EditableHeader from '../editable-header';
import { handleResponse } from '~/lib/response/handle-response';
import { useTranslation } from 'react-i18next';

interface OrganizationHeaderProps {
  id: string;
  name: string;
  currentUserRole: string;
  logo?: string;
  owner: {
    id: string;
    name: string;
    email?: string | null;
  };
}

function Header({ name, logo, owner, id, currentUserRole }: OrganizationHeaderProps) {
  const rolesThatCanEdit = new Set(['agency_member', 'agency_project_manager', 'agency_owner']);
  const ownerUserId = owner.id;
  const { t } = useTranslation('responses');
  return (
    <div className="flex w-full gap-4">
      <UpdateAccountImageContainer
        user={{
          id,
          pictureUrl: logo ?? '',
        }}
        bucketName="organization"
        showDescriptions={false}
        floatingDeleteButton={true}
        className="aspect-square h-16 w-16"
      />

      <div className="flex flex-col gap-1">
        <EditableHeader
          initialName={name}
          id={id}
          userRole={currentUserRole}
          updateFunction={async (id, data) => {
            const res = await updateOrganization(id as string, ownerUserId, data);
            await handleResponse(res, 'organizations', t).catch(() => null);
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
