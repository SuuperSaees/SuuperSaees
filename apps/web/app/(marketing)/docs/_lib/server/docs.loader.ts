import { cache } from 'react';

import { createCmsClient } from '@kit/cms';

export const getDocs = cache(async (language: string | undefined) => {
  const cms = await createCmsClient();

  const { items: pages } = await cms.getContentItems({
    collection: 'documentation',
    language,
  });

  return pages;
});
