import { getLogger } from '.';
import { Logger as LoggerInstance } from './logger';

export const createLogger = async (): Promise<LoggerInstance> => {
  return await getLogger();
};
