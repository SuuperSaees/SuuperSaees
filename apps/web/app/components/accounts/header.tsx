'use client';

import EditableHeader from '~/components/editable-header';

import UpdateImage from '../ui/update-image';
import { Account } from '~/lib/account.types';
import { PageMobileNavigation } from '@kit/ui/page';
import { HomeMobileNavigation } from '~/(main)/home/(user)/_components/home-mobile-navigation';

type AccountType = Pick<Account.Type, 'id' | 'name' | 'email' | 'picture_url'>;

type BucketStorage = {
  id: string;
  name: string;
  identifier: string;
}

type Controllers = {
  onUpdateAccountImage: (value: string) => Promise<void>;
  onUpdateAccountName: (value: string) => Promise<void>;
}
interface AccountHeaderProps {
  id: string;
  currentUserRole: string;
  account:  AccountType
  rolesThatCanEdit: Set<string>;
  bucketStorage: BucketStorage;
  emailLabel?: string;
  controllers: Controllers
}

function Header({
  account,
  id,
  currentUserRole,
  bucketStorage,
  controllers,
  emailLabel,
  rolesThatCanEdit,
}: AccountHeaderProps) {

  return (
    <div className="flex w-full lg:gap-4 gap-1">
      <PageMobileNavigation className={"flex items-center justify-between w-fit" }>
        <HomeMobileNavigation />
      </PageMobileNavigation>
      <UpdateImage
        bucketStorage={bucketStorage}
        floatingButtons={{ update: true, delete: true }}
        defaultImageURL={account.picture_url ?? ''}
        className="aspect-square h-12 w-12 md:block hidden"
        onUpdate={controllers.onUpdateAccountImage}
      />

      <div className="flex flex-col gap-1">
        <EditableHeader
          initialName={account.name}
          id={id}
          userRole={currentUserRole}
          updateFunction={async (value: string) =>
            controllers.onUpdateAccountName && (await controllers.onUpdateAccountName(value))
          }
          rolesThatCanEdit={rolesThatCanEdit}
        />
        <p className="text-sm text-gray-600">
          {emailLabel && emailLabel}
          {': '}
          {account.email}
        </p>
      </div>
    </div>
  );
}

export default Header;
