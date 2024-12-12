'use client';

import { useRevalidatePersonalAccountDataQuery } from '../../hooks/use-personal-account-data';
import { UpdateAccountDetailsForm } from './update-account-details-form';

export function UpdateAccountDetailsFormContainer({
  user,
}: {
  user: {
    name: string | null;
    id: string;
    settings?: {
      name: string | null;
      picture_url: string | null;
    }
  };
}) {
  const revalidateUserDataQuery = useRevalidatePersonalAccountDataQuery();

  return (
    <UpdateAccountDetailsForm
      displayName={user?.settings?.name ?? user?.name ?? ''}
      userId={user.id}
      onUpdate={() => revalidateUserDataQuery(user.id)}
    />
  );
}
