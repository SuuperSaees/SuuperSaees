'use client';

import { useMemo } from 'react';

import DOMPurify from 'dompurify';
import EmptyState from '~/components/ui/empty-state';
import { useTranslation } from 'react-i18next';

interface EmbedPreviewProps {
  embedSrc: string;
  allowedDomains?: string[]; // Domains that are allowed for embedding
}

export function EmbedPreview({ embedSrc }: EmbedPreviewProps) {
  const { t } = useTranslation('embeds');
  const embedContent = useMemo(() => {
    if (!embedSrc?.trim()) {
      return (
        <EmptyState 
          title={t('empty.title')}
          description={t('empty.description')}
          imageSrc='/images/illustrations/Illustration-box.svg'
          className='bg-transparent'
        />
      );
    }

    return isIframeCode(embedSrc)
      ? renderIframeFromCode(embedSrc)
      : renderIframeFromUrl(embedSrc);
  }, [embedSrc, t]);

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden rounded-lg ">
      {embedContent}
    </div>
  );
}

/**
 * Checks if the provided string is an iframe HTML code
 */
function isIframeCode(value: string): boolean {
  return value.trim().toLowerCase().startsWith('<iframe');
}

/**
 * Validates if a URL is from an allowed domain
 */
function isUrlAllowed(url: string, allowedDomains?: string[]): boolean {
  try {
    const urlObj = new URL(url);
    return allowedDomains
      ? allowedDomains?.some((domain) => urlObj.hostname.endsWith(domain))
      : true;
  } catch {
    return false; // Invalid URL
  }
}

/**
 * Renders an iframe from a URL after security validation
 */
function renderIframeFromUrl(url: string, allowedDomains?: string[]) {
  // Security check: Validate URL against allowed domains
  if (!isUrlAllowed(url, allowedDomains)) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-destructive">
        This domain is not allowed for embedding
      </div>
    );
  }

  return (
    <iframe
      src={url}
      className="h-full w-full"
      style={{ height: '100%' }}
      title="Embedded content"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      referrerPolicy="no-referrer"
      loading="lazy"
      allowFullScreen
    />
  );
}

/**
 * Extracts and renders an iframe from HTML code with security measures
 */
function renderIframeFromCode(code: string, allowedDomains?: string[]) {
  try {
    // Sanitize the HTML code using DOMPurify
    const sanitizedCode = (
      DOMPurify as unknown as {
        sanitize(dirty: string, config?: object): string;
      }
    ).sanitize(code, {
      ALLOWED_TAGS: ['iframe'],
      ALLOWED_ATTR: [
        'src',
        'title',
        'allow',
        'allowfullscreen',
        'width',
        'height',
        'style',
        'class',
      ],
    });

    // Parse the sanitized iframe
    const parser = new DOMParser();
    const doc = parser.parseFromString(sanitizedCode, 'text/html');
    const iframe = doc.querySelector('iframe');

    if (!iframe) {
      throw new Error('No iframe found in the provided code');
    }

    // Extract and validate the src attribute
    const src = iframe.getAttribute('src') ?? '';

    // Security check: Validate URL against allowed domains
    if (!isUrlAllowed(src, allowedDomains)) {
      return (
        <div className="flex h-full items-center justify-center p-4 text-destructive">
          This domain is not allowed for embedding
        </div>
      );
    }

    const allow = iframe.getAttribute('allow') ?? '';
    const title = iframe.getAttribute('title') ?? 'Embedded content';

    return (
      <iframe
        src={src}
        className="h-full w-full"
        style={{ height: '100%' }}
        title={title}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        allow={
          allow ||
          'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
        }
        referrerPolicy="no-referrer"
        loading="lazy"
        allowFullScreen
      />
    );
  } catch (error) {
    console.error('Error parsing iframe code:', error);
    return (
      <div className="flex h-full items-center justify-center p-4 text-destructive">
        Invalid iframe code
      </div>
    );
  }
}
