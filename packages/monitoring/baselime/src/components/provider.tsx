import { useRef } from 'react';

import { BaselimeRum } from '@baselime/react-rum';

import { MonitoringContext } from '@kit/monitoring-core';

import { useBaselime } from '../hooks/use-baselime';

export function BaselimeProvider({
  children,
  apiKey,
  enableWebVitals,
  ErrorPage,
}: React.PropsWithChildren<{
  apiKey: string;
  enableWebVitals?: boolean;
  ErrorPage?: React.ReactElement;
}>) {
  return (
    <BaselimeRum
      apiKey={apiKey}
      enableWebVitals={enableWebVitals}
      fallback={ErrorPage ?? null}
    >
      <MonitoringProvider>{children}</MonitoringProvider>
    </BaselimeRum>
  );
}

function MonitoringProvider(props: React.PropsWithChildren) {
  const service = useBaselime();
  const provider = useRef(service);

  return (
    <MonitoringContext.Provider value={provider.current}>
      {props.children}
    </MonitoringContext.Provider>
  );
}
