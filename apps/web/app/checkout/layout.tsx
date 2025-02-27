import { cookies } from 'next/headers';
import { withI18n } from '~/lib/i18n/with-i18n';


import { RootProviders } from '~/components/root-providers';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';

async function CheckoutLayoutUrl({ children }: React.PropsWithChildren) {
  const { language } = await createI18nServerInstance();
  const theme = getTheme();

  return (
    <RootProviders 
      theme={theme}
      lang={language}
      organizationSettings={[]}
    >
          {children}
    </RootProviders>
  );
}

export default withI18n(CheckoutLayoutUrl);

function getTheme() {
  const cookieValue = (cookies() as { get(name: string): { value: string } | undefined }).get('theme')?.value;
  return cookieValue ?? 'light';
}