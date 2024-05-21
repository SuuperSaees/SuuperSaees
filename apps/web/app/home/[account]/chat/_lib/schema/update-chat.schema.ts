import { z } from 'zod';

import { ChatSettingsSchema } from './chat-settings.schema';
import { ReferenceIdSchema } from './reference-id.schema';

export const UpdateChatSchema = z.object({
  referenceId: ReferenceIdSchema,
  settings: ChatSettingsSchema,
});
