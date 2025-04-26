'use client';

import { CheckCircle2, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { cn } from '@kit/ui/utils';

export function AuthSuccessAlert({
  title,
  description,
  visible = true,
  onClose,
  className,
}: {
  title?: string;
  description?: string;
  visible?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  if (!title && !description) return null;
  if (!visible) return null;
  return (
    <Alert
      variant={'default'}
      className={cn(
        'flex items-start gap-3 px-2 py-4 text-gray-600',
        className,
      )}
    >
      <div className="relative flex w-9 items-center justify-center">
        <div className="absolute h-9 w-9 animate-pulse rounded-full border-2 border-gray-200"></div>
        <div className="absolute h-7 w-7 animate-pulse rounded-full border-2 border-gray-300"></div>
        <CheckCircle2 className="h-5 w-5 text-gray-500" />
      </div>
      <div className="flex flex-col justify-start gap-1 pr-4 text-start">
        {title && <AlertTitle className="flex gap-2">{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </div>
      <button
        onClick={onClose}
        className="absolute right-2 top-2 text-gray-400 transition-all hover:text-gray-600"
      >
        <X className="h-5 w-5" />
      </button>
    </Alert>
  );
}
