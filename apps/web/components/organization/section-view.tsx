'use client';

import { useState } from 'react';

import { Search } from 'lucide-react';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { useTranslation } from 'react-i18next';

// import { Input } from '@kit/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import FileSection from './files';
import { InviteClientMembersDialogContainer } from './invite-client-members-dialog';
import InvoiceSection from './invoices';
import MemberSection from './members';
import ReviewSection from './reviews';
import ServiceSection from './services';

/**
 * @description This component is used to display the navigation tabs for the account settings page.
 */
function SectionView({
  clientOrganizationId,
}: {
  clientOrganizationId: string;
}) {
  const [search, setSearch] = useState('');
  const { t } = useTranslation('clients');
  const navigationOptionsMap = new Map<string, JSX.Element>([
    [
      'members',
      <MemberSection key={'members'} search={search} setSearch={setSearch} />,
    ],
    ['services', <ServiceSection key={'services'} />],
    ['files', <FileSection key={'files'} />],
    ['reviews', <ReviewSection key={'reviews'} />],
    ['invoices', <InvoiceSection key={'invoices'} />],
  ]);

  return (
    <Tabs defaultValue={Array.from(navigationOptionsMap.keys())[0]}>
      <div className="flex justify-between">
        <TabsList className="gap-2 bg-transparent">
          {Array.from(navigationOptionsMap.keys()).map((option) => (
            <TabsTrigger
              value={option}
              key={option + 'tab'}
              className="font-semibold hover:bg-brand-50/30 hover:text-brand data-[state=active]:bg-brand-50/60 data-[state=active]:text-brand-900"
            >
              {t(`organizations.${option}.title`)
                .split('')
                .map((char, index) => (index === 0 ? char.toUpperCase() : char))
                .join('')}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex gap-4">
          <div className="relative w-fit flex-1 md:grow-0">
            <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <ThemedInput
              value={search}
              onInput={(
                e:
                  | React.ChangeEvent<HTMLInputElement>
                  | React.FormEvent<HTMLFormElement>,
              ) => setSearch((e.target as HTMLInputElement).value)}
              placeholder={'Search...'}
              className="w-full rounded-lg bg-background pr-8 md:w-[200px] lg:w-[320px]"
            />
          </div>
          <InviteClientMembersDialogContainer
            clientOrganizationId={clientOrganizationId}
            userRoleHierarchy={2}
          >
            <ThemedButton>Add member</ThemedButton>
          </InviteClientMembersDialogContainer>
        </div>
      </div>
      {Array.from(navigationOptionsMap.values()).map((option) => (
        <TabsContent
          value={option.key ?? ''}
          className="h-full max-h-full min-h-0 w-full border-t py-8"
          key={option.key + 'content'}
        >
          {option}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default SectionView;
