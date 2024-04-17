import { CmsClient } from './cms-client';
import { CmsType } from './cms.type';

/**
 * Creates a CMS client based on the specified type.
 *
 * @param {CmsType} type - The type of CMS client to create. Defaults to the value of the CMS_CLIENT environment variable.
 * @returns {Promise<CmsClient>} A Promise that resolves to the created CMS client.
 * @throws {Error} If the specified CMS type is unknown.
 */
export async function createCmsClient(
  type: CmsType = process.env.CMS_CLIENT as CmsType,
): Promise<CmsClient> {
  return cmsClientFactory(type);
}

async function cmsClientFactory(type: CmsType) {
  switch (type) {
    case 'wordpress':
      return getWordpressClient();

    case 'keystatic':
      return getKeystaticClient();

    default:
      throw new Error(`Unknown CMS type`);
  }
}

async function getWordpressClient() {
  const { WordpressClient } = await import('../../wordpress/src/wp-client');

  return new WordpressClient();
}

async function getKeystaticClient() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { KeystaticClient } = await import('../../keystatic/src/client');

    return new KeystaticClient();
  }

  console.error(`[CMS] Keystatic client is only available in Node.js runtime. Please choose a different CMS client. Returning a mock client instead of throwing an error.`);

  return mockCMSClient();
}

function mockCMSClient() {
  return {
    async getContentItems() {
      return [];
    },
  };
}
