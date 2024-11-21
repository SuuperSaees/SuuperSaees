'use client';

import EditableHeader from '~/components/editable-header';

import UpdateImage from '../ui/update-image';

interface AccountHeaderProps {
  id: string;
  currentUserRole: string;
  account: {
    id: string;
    name: string;
    picture_url?: string;
    email?: string | null;
  };
  bucketStorage: { id: string; name: string; identifier: string };
  emailLabel?: string;
  controllers: {
    onUpdateAccountImage: (value: string) => Promise<void>;
    onUpdateAccountName: (value: string) => Promise<void>;
  };
}

function Header({
  account,
  id,
  currentUserRole,
  bucketStorage,
  controllers,
  emailLabel,
}: AccountHeaderProps) {
  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  return (
    <div className="flex w-full gap-4">
      <UpdateImage
        bucketStorage={bucketStorage}
        floatingButtons={{ update: true, delete: true }}
        defaultImageURL={account.picture_url ?? ''}
        className="aspect-square h-16 w-16"
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
