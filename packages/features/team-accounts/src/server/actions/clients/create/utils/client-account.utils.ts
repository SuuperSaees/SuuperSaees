import { z } from 'zod';

export const SUUPER_CLIENT_ID = z
  .string({
    description: 'The Client id for the Suuper API',
    required_error: 'Please provide the client id for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID);

export const SUUPER_CLIENT_SECRET = z
  .string({
    description: 'The Client secret for the Suuper API',
    required_error: 'Please provide the client secret for the Suuper API',
  })
  .parse(process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET);