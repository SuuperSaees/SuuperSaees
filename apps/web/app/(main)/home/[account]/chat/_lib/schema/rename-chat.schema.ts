import { z } from 'zod';

import { ReferenceIdSchema } from './reference-id.schema';

export const RenameChatSchema = z.object({
  referenceId: ReferenceIdSchema,
  name: z.string().min(1).max(2000),
});
