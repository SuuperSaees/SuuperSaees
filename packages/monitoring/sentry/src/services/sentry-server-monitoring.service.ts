import * as Sentry from '@sentry/nextjs';

import { MonitoringService } from '@kit/monitoring-core';

/**
 * @class
 * @implements {MonitoringService}
 * ServerSentryMonitoringService is responsible for capturing exceptions and identifying users using the Sentry monitoring service.
 */
export class SentryServerMonitoringService implements MonitoringService {
  captureException(error: Error | null) {
    return Sentry.captureException(error);
  }

  identifyUser(user: Sentry.User) {
    Sentry.setUser(user);
  }
}
