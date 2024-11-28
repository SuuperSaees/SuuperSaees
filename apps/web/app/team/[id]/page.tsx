import { PageBody } from '@kit/ui/page';

import {
  getUserById,
  getUserRole,
} from '~/team-accounts/src/server/actions/members/get/get-member-account';

import Member from './components/member';

export default async function MemberPage({
  params,
}: {
  params: { id: string };
}) {
  const id = params.id;
  const userRole = await getUserRole().catch((error) => {
    console.error('Error fetching user role in team member page:', error);
    return '';
  });

  const user = await getUserById(id).catch((error) => {
    console.error('Error fetching user in team member page:', error);
    return null;
  });

  if (!user) return null;

  return (
    <PageBody className="flex h-full flex-col gap-8 p-8 py-8 lg:px-8">
      <Member id={id} userRole={userRole} user={user} />
    </PageBody>
  );
}
