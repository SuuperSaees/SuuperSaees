import { use } from 'react';

import { ServerDataLoader } from '@makerkit/data-loader-supabase-nextjs';

import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { Input } from '@kit/ui/input';
import { PageBody } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

import { NewTaskDialog } from './_components/new-task-dialog';
import { TasksTable } from './_components/tasks-table';
import { UserAccountHeader } from './_components/user-account-header';
import { loadUserWorkspace } from './_lib/server/load-user-workspace';

interface SearchParams {
  page?: string;
  query?: string;
}

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:homePage');

  return {
    title,
  };
};

function UserHomePage(props: { searchParams: SearchParams }) {
  const client = getSupabaseServerComponentClient();
  const { user } = use(loadUserWorkspace());

  const page = parseInt(props.searchParams.page ?? '1', 10);
  const query = props.searchParams.query ?? '';

  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'common:homeTabLabel'} />}
        description={<Trans i18nKey={'common:homeTabDescription'} />}
      />

      <PageBody className={'space-y-4'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Heading level={4}>
              <Trans i18nKey={'tasks:tasksTabLabel'} defaults={'Tasks'} />
            </Heading>
          </div>

          <div className={'flex items-center space-x-2'}>
            <form className={'w-full'}>
              <Input
                name={'query'}
                defaultValue={query}
                className={'w-full lg:w-[18rem]'}
                placeholder={'Search tasks'}
              />
            </form>

            <NewTaskDialog />
          </div>
        </div>

        <ServerDataLoader
          client={client}
          table={'tasks'}
          page={page}
          where={{
            account_id: {
              eq: user.id,
            },
            title: {
              textSearch: query ? `%${query}%` : undefined,
            },
          }}
        >
          {(props) => {
            return (
              <div className={'flex flex-col space-y-8'}>
                <If condition={props.count === 0 && query}>
                  <div className={'flex flex-col space-y-2.5'}>
                    <p>
                      <Trans
                        i18nKey={'tasks:noTasksFound'}
                        values={{ query }}
                      />
                    </p>

                    <form>
                      <input type="hidden" name={'query'} value={''} />

                      <Button variant={'outline'} size={'sm'}>
                        <Trans i18nKey={'tasks:clearSearch'} />
                      </Button>
                    </form>
                  </div>
                </If>

                <TasksTable {...props} />
              </div>
            );
          }}
        </ServerDataLoader>
      </PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
