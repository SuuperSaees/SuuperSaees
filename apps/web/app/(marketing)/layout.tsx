import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';

import { SiteFooter } from '~/(marketing)/_components/site-footer';
import { SiteHeader } from '~/(marketing)/_components/site-header';
import { withI18n } from '~/lib/i18n/with-i18n';

async function SiteLayout(props: React.PropsWithChildren) {
  const user = await getUser();

  return (
    <div className={'flex min-h-[100vh] flex-col'}>
      <SiteHeader user={user} />

      {props.children}

      <SiteFooter />
    </div>
  );
}

export default withI18n(SiteLayout);

async function getUser() {
  const client = getSupabaseServerComponentClient();

  // Supabase is going to be complaining about this line
  // since we use getSession instead of getUser
  // we don't quite care because we only need to know if the user is logged in
  // to display the user menu in the header.
  // There is no need to ping the server while navigating to marketing pages.
  const {
    data: { session },
  } = await client.auth.getSession();

  return session?.user;
}
