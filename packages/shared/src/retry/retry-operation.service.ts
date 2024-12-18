import { getLogger } from '../logger';

interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  backoffFactor: number;
}

export class RetryOperationService<T> {
  constructor(
    private readonly operation: () => Promise<T>,
    private readonly options: RetryOptions = {
      maxAttempts: 3,
      delayMs: 1000,
      backoffFactor: 2,
    },
    private readonly logger = getLogger(),
  ) {}

  async execute(): Promise<T> {
    let attempt = 1;
    let lastError: Error | undefined;

    while (attempt <= this.options.maxAttempts) {
      try {
        return await this.operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === this.options.maxAttempts) {
          (await this.logger).error(
            { error, attempt },
            'Operation failed after all retries',
          );
          throw error;
        }

        (await this.logger).warn(
          { error, attempt },
          'Operation failed, retrying...',
        );

        const delay =
          this.options.delayMs *
          Math.pow(this.options.backoffFactor, attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));

        attempt++;
      }
    }

    if (!lastError) {
      throw new Error('Unknown error occurred');
    }
    throw lastError;
  }
}
