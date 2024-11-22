'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { updateUserSettings } from '~/team-accounts/src/server/actions/members/update/update-account';

import Header from '../../../components/accounts/header';

export default function Member({
  id,
  userRole,
  user,
}: {
  id: string;
  userRole: string;
  user: {
    name: string;
    email: string | null;
    id: string;
    settings: {
      name: string | null;
      picture_url: string | null;
    } | null;
  };
}) {
  const { t } = useTranslation();

  const updateMemberImage = async (value: string) => {
    try {
      await updateUserSettings(id, { picture_url: value });
      toast.success('Success', {
        description: t('account:updateProfileSuccess'),
      });
    } catch (error) {
      toast.error('Error', {
        description: t('account:updateProfileError'),
      });
    }
  };

  const updateMemberName = async (value: string) => {
    try {
      await updateUserSettings(id, { name: value });
      toast.success('Success', {
        description: t('account:updateProfileSuccess'),
      });
    } catch (error) {
      toast.error('Error', {
        description: t('account:updateProfileError'),
      });
    }
  };

  const rolesThatCanEdit = new Set([
    'agency_member',
    'agency_project_manager',
    'agency_owner',
  ]);

  return (
    <Header
      id={id}
      currentUserRole={userRole}
      account={{
        id: user.id,
        name: user.settings?.name ?? user.name,
        email: user.email ?? '',
        picture_url: user.settings?.picture_url ?? '',
      }}
      bucketStorage={{
        id,
        name: 'account_image',
        identifier: 'team_member',
      }}
      emailLabel="Email"
      controllers={{
        onUpdateAccountImage: updateMemberImage,
        onUpdateAccountName: updateMemberName,
      }}
      rolesThatCanEdit={rolesThatCanEdit}
    />
  );
}
