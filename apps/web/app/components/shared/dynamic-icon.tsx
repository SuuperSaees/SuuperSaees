'use client';

import React, { lazy, Suspense } from 'react';
import type { LucideProps } from 'lucide-react';
import { Box } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { SkeletonBox } from '~/components/ui/skeleton';

// Dynamic Icon component
interface DynamicIconProps extends Omit<LucideProps, 'ref'> {
  name: string;
}

/**
 * DynamicIcon component that loads Lucide icons on demand
 * 
 * @param name - The name of the Lucide icon to load
 * @param props - Additional props to pass to the icon component
 * @returns A dynamically loaded Lucide icon or a fallback
 * 
 * @example
 * ```tsx
 * <DynamicIcon name="home" className="w-4 h-4" />
 * ```
 */
export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Check if the icon name exists in dynamicIconImports
  if (name && name in dynamicIconImports) {
    const LucideIcon = lazy(dynamicIconImports[name as keyof typeof dynamicIconImports]);
    return (
      <Suspense fallback={<SkeletonBox className="w-4 h-4" />}>
        <LucideIcon {...props} />
      </Suspense>
    );
  }
  // Fallback to Box icon if name doesn't exist
  return <Box {...props} />;
}; 