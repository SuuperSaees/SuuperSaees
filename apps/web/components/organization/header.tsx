import { UpdateAccountImageContainer } from 'node_modules/@kit/accounts/src/components/personal-account-settings/update-account-image-container';

import { Trans } from '@kit/ui/trans';

interface OrganizationHeaderProps {
  id: string;
  name: string;
  logo?: string;
  owner: {
    name: string;
    email?: string | null;
  };
}

function Header({ id, name, logo, owner }: OrganizationHeaderProps) {
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
        <h1 className="text-3xl font-bold">{name}</h1>
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
