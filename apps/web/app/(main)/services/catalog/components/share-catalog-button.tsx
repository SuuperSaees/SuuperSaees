'use client';

import { useState } from 'react';
import { Button } from '@kit/ui/button';
import { Copy, Share2, Check } from 'lucide-react';
import { Trans } from '@kit/ui/trans';
import { useTranslation } from 'react-i18next';

interface ShareCatalogButtonProps {
  baseUrl: string;
}

export default function ShareCatalogButton({ baseUrl }: ShareCatalogButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation('services');
  
  const catalogUrl = `${baseUrl}/services/catalog/public`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(catalogUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('services:catalog.share.pageTitle'),
          text: t('services:catalog.share.description'),
          url: catalogUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy
      void handleCopyUrl();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">
          <Trans i18nKey="services:catalog.share.title" defaults="Share" />
        </span>
      </Button>

      {/* Copy URL Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyUrl}
        className={`flex items-center gap-2 transition-all duration-200 ${
          copied 
            ? 'border-green-200 bg-green-50 text-green-700' 
            : 'text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-300'
        }`}
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">
              <Trans i18nKey="services:catalog.share.linkCopied" defaults="Copied!" />
            </span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">
              <Trans i18nKey="services:catalog.share.copyLink" defaults="Copy Link" />
            </span>
          </>
        )}
      </Button>

      {/* URL Preview */}
      {/* <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
        <ExternalLink className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-600 font-mono max-w-xs truncate">
          {catalogUrl}
        </span>
      </div> */}
    </div>
  );
} 