'use client';

import * as React from 'react';

import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { useTranslation } from 'react-i18next';

interface CopyInputProps {
  label: string;
  value: string;
  prefix?: string;
  className?: string;
}

export function CopyDomain({
  value,
  prefix = 'https://',
  className,
}: CopyInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {t} = useTranslation('account');

  const copyToClipboard = async () => {
    try {
      if (inputRef.current) {
        await navigator.clipboard.writeText(value);
        toast.success(t('updateSuccess'), {
          description: t('clipboardCopied'),
        });
      }
    } catch (err) {
      toast.error('Error', {
        description: t('clipboardError'),
      });
    }
  };

  return (
    <div className={className}>
      <div className="mt-1.5 flex">
        <div className="relative flex flex-grow items-center">
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            {prefix}
          </div>
          <Input
            ref={inputRef}
            type="text"
            id="domain"
            value={value}
            className="pl-[4.5rem]"
            readOnly
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="ml-2 shrink-0"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
