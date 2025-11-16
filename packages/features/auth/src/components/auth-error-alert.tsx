import { CircleAlert, X } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { cn } from '@kit/ui/utils';

/**
 * @name AuthErrorAlert
 * @param error This error comes from Supabase as the code returned on errors
 * This error is mapped from the translation auth:errors.{error}
 * To update the error messages, please update the translation file
 * https://github.com/supabase/gotrue-js/blob/master/src/lib/errors.ts
 * @constructor
 */
export function AuthErrorAlert({
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
        'relative flex items-start gap-3 px-2 py-4 text-gray-600',
        className,
      )}
    >
      <div className="relative flex w-9 items-center justify-center">
        <div className="absolute h-9 w-9 animate-pulse rounded-full border-2 border-red-200"></div>
        <div className="absolute h-7 w-7 animate-pulse rounded-full border-2 border-red-300"></div>
        <CircleAlert className="h-5 w-5 text-red-500" />
      </div>
      <div className="flex flex-col justify-start gap-1 text-start pr-4">
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
