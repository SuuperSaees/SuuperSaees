'use client';


import { Trans } from '@kit/ui/trans';
import { updateOrganization } from '../../../../packages/features/team-accounts/src/server/actions/organizations/update/update-organizations';
import EditableHeader from '../editable-header';
import { handleResponse } from '~/lib/response/handle-response';
import { useTranslation } from 'react-i18next';
import UpdateImage from '../../app/components/ui/update-image';
import { cn } from '@kit/ui/utils';
import WalletSummarySheet from '~/(credits)/components/wallet-summary-sheet';
interface OrganizationHeaderProps {
  id: string;
  name: string;
  currentUserRole: string;
  logo?: string;
  owner?: {
    id: string;
    name: string;
    email?: string | null;
  };
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
}

function Header({ 
  name, 
  logo, 
  owner, 
  id, 
  currentUserRole, 
  className, 
  imageClassName = "aspect-square h-12 w-12 flex-shrink-0 md:block hidden", 
  contentClassName = "flex flex-col justify-center" 
}: OrganizationHeaderProps) {
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
    <div className={cn('flex w-full md:gap-4 gap-1 ', className)}>

       <UpdateImage
        bucketStorage={bucketStorage}
        floatingButtons={{ update: true, delete: true }}
        defaultImageURL={logo ?? ''}
        className={imageClassName}
        onUpdate={onUpdateAccountImage}
      />

      <div className={contentClassName}>
        <EditableHeader
          initialName={name}
          userRole={currentUserRole}
          updateFunction={async (value: string) => {
            const res = await updateOrganization(id, {
              name: value,
            });
            await handleResponse(res, 'organizations', t).catch(() => null);
          }}
          rolesThatCanEdit={rolesThatCanEdit}
        />
        {owner ? <p className="text-sm text-gray-600">
          <Trans i18nKey={'clients:organizations.members.owner'} />
          {': '}
          {owner?.email}
        </p> : null}
      </div>
      <WalletSummarySheet triggerClassName="ml-auto" />
    </div>
  );
}

export default Header;
