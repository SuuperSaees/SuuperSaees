import { MonitoringService } from '@kit/monitoring-core';

export class ConsoleMonitoringService implements MonitoringService {
  identifyUser() {
    // noop
  }

  captureException(error: Error) {
    console.error(
      `[Console Monitoring] Caught exception: ${JSON.stringify(error)}`,
    );
  }
}
