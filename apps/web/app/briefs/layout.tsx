import { withI18n } from '~/lib/i18n/with-i18n';

import Panel from './components/panel';
import { BriefsProvider } from './contexts/briefs-context';

function BriefsLayout({ children }: React.PropsWithChildren) {
  return (
    <BriefsProvider>
      <div className="flex h-full max-h-full gap-8">
        {children}
        <Panel />
      </div>
    </BriefsProvider>
  );
}

export default withI18n(BriefsLayout);
