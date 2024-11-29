'use client';

import { Dispatch, SetStateAction } from 'react';

import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import { InviteClientMembersDialogContainer } from './invite-client-members-dialog';
import { useTranslation } from 'react-i18next';

interface MemberButtonTriggersProps {
  clientOrganizationId: string;
  currentUserRole: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
}
export default function MemberButtonTriggers({
  clientOrganizationId,
  currentUserRole,
  search,
  setSearch,
}: MemberButtonTriggersProps) {
  const {t} = useTranslation('organizations')
  return (
    <>
      <div className="relative w-fit flex-1 md:grow-0">
        <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <ThemedInput
          value={search}
          onInput={(
            e:
              | React.ChangeEvent<HTMLInputElement>
              | React.FormEvent<HTMLFormElement>,
          ) => setSearch((e.target as HTMLInputElement).value)}
          placeholder={t('members.search')}
          className="w-full rounded-lg bg-background pr-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
      {(currentUserRole === 'agency_owner' || currentUserRole === 'agency_project_manager' ||
        currentUserRole === 'client_owner') && (
        <InviteClientMembersDialogContainer
          clientOrganizationId={clientOrganizationId}
          userRoleHierarchy={2}
        >
          <ThemedButton>{t('members.addButton')}</ThemedButton>
        </InviteClientMembersDialogContainer>
      )}
    </>
  );
}
