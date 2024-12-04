'use client';


import { Trans } from '@kit/ui/trans';
import { updateOrganization } from '../../../../packages/features/team-accounts/src/server/actions/organizations/update/update-organizations';
import EditableHeader from '../editable-header';
import { handleResponse } from '~/lib/response/handle-response';
import { useTranslation } from 'react-i18next';
import UpdateImage from '../../app/components/ui/update-image';

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
  const { t } = useTranslation('responses');

  const onUpdateAccountImage = async (value: string) => {
    const res = await updateOrganization(id, {
      picture_url: value,
    });
    await handleResponse(res, 'organizations', t).catch(() => null);
  };

  const bucketStorage = {
    id,
    name: 'organization',
    identifier: '',
  };
  return (
    <div className="flex w-full gap-4">
       <UpdateImage
        bucketStorage={bucketStorage}
        floatingButtons={{ update: true, delete: true }}
        defaultImageURL={logo ?? ''}
        className="aspect-square h-16 w-16"
        onUpdate={onUpdateAccountImage}
      />

      <div className="flex flex-col gap-1">
        <EditableHeader
          initialName={name}
          id={id}
          userRole={currentUserRole}
          updateFunction={async (value: string) => {
            const res = await updateOrganization(id, {
              name: value,
            });
            await handleResponse(res, 'organizations', t).catch(() => null);
          }}
          rolesThatCanEdit={rolesThatCanEdit}
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
