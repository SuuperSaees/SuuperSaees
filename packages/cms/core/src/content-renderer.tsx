import { CmsType } from './cms.type';

export async function ContentRenderer({
  content,
  type = process.env.CMS_CLIENT as CmsType,
}: {
  content: unknown;
  type?: CmsType;
}) {
  switch (type) {
    case 'keystatic': {
      const { KeystaticDocumentRenderer } = await import(
        '../../keystatic/src/content-renderer'
      );

      return KeystaticDocumentRenderer({ content });
    }

    case 'wordpress': {
      const { WordpressContentRenderer } = await import(
        '../../wordpress/src/content-renderer'
      );

      return WordpressContentRenderer({ content });
    }
  }
}
