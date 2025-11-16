"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "../utils/cn"

const Progress = React.forwardRef<
  HTMLDivElement,
  ProgressPrimitive.ProgressProps
>(({ className, style, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-brand transition-all"
      style={{ 
        transform: `translateX(-${100 - (value ?? 0)}%)`,
        backgroundColor: '#1A38D7',
        ...style,
      }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
