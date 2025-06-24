import { CircleAlert, X } from "lucide-react";

import {
  Alert as AlertProvider,
  AlertDescription,
  AlertTitle,
} from "@kit/ui/alert";
import { cn } from "@kit/ui/utils";
import React from "react";

type AlertType = "warning" | "error" | "success" | "info";

interface AlertProps {
  type?: AlertType;
  title?: string;
  description?: React.ReactNode | string;
  visible?: boolean;
  onClose?: () => void;
  className?: string;
  action?: React.ReactNode;
}

const getAlertStyles = (type: AlertType) => {
  const styles = {
    warning: {
      borderColor: "border-amber-200",
      pulseOuter: "border-amber-200",
      pulseInner: "border-amber-300",
      icon: "text-amber-500",
    },
    error: {
      borderColor: "border-red-200",
      pulseOuter: "border-red-200",
      pulseInner: "border-red-300",
      icon: "text-red-500",
    },
    success: {
      borderColor: "border-green-200",
      pulseOuter: "border-green-200",
      pulseInner: "border-green-300",
      icon: "text-green-500",
    },
    info: {
      borderColor: "border-blue-200",
      pulseOuter: "border-blue-200",
      pulseInner: "border-blue-300",
      icon: "text-blue-500",
    },
  };
  
  return styles[type];
};

export function Alert({
  type = "warning",
  title,
  description,
  visible = true,
  onClose,
  className,
  action,
}: AlertProps) {
  if (!title && !description) return null;
  if (!visible) return null;
  
  const alertStyles = getAlertStyles(type);
  
  return (
    <AlertProvider
      variant={"default"}
      className={cn(
        "relative flex items-start gap-3 px-2 py-4 text-gray-600",
        className,
      )}
    >
      <div className="relative flex w-9 items-center justify-center">
        <div className={cn(
          "absolute h-9 w-9 animate-pulse rounded-full border-2",
          alertStyles.pulseOuter
        )}></div>
        <div className={cn(
          "absolute h-7 w-7 animate-pulse rounded-full border-2",
          alertStyles.pulseInner
        )}></div>
        <CircleAlert className={cn("h-5 w-5", alertStyles.icon)} />
      </div>
      <div className="flex flex-col justify-start gap-2 text-start pr-4">
        {title && <AlertTitle className="flex gap-2">{title}</AlertTitle>}
        {description && (
          <AlertDescription>{description as string}</AlertDescription>
        )}
        {action ? <>{action}</> : null}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-gray-400 transition-all hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </AlertProvider>
  );
}
