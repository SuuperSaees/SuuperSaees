import { z } from 'zod';

/**
 * Create a KeyStatic reader based on the storage kind.
 */
export async function createKeystaticReader() {
  switch (process.env.KEYSTATIC_STORAGE_KIND ?? 'local') {
    case 'local': {
      const { default: config } = await import('./keystatic.config');
      const { createReader } = await import('@keystatic/core/reader');

      return createReader('.', config);
    }

    case 'github':
    case 'cloud': {
      const { default: config } = await import('./keystatic.config');

      const githubConfig = z
        .object({
          token: z.string(),
          repo: z.custom<`${string}/${string}`>(),
          pathPrefix: z.string().optional(),
        })
        .parse({
          token: process.env.KEYSTATIC_GITHUB_TOKEN,
          repo: process.env.KEYSTATIC_STORAGE_REPO,
          pathPrefix: process.env.KEYSTATIC_PATH_PREFIX,
        });

      const { createGitHubReader } = await import(
        '@keystatic/core/reader/github'
      );

      return createGitHubReader(config, githubConfig);
    }

    default:
      throw new Error(`Unknown storage kind`);
  }
}
