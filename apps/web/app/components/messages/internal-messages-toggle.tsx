'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';
import { isBrowser } from '@kit/shared/utils';

interface InternalMessagesToggleProps {
  /**
   * The user's role to determine if they can access internal messaging
   */
  userRole: string;
  /**
   * Array of roles that are allowed to use internal messaging
   * @default ['agency_member', 'agency_project_manager', 'agency_owner', 'project_manager', 'assistant', 'owner']
   */
  allowedRoles?: string[];
  /**
   * Optional className for styling
   */
  className?: string;
  /**
   * Optional callback when the internal messaging state changes
   */
  onStateChange?: (isEnabled: boolean) => void;
  /**
   * Optional label to display when internal messaging is enabled
   * @default "Internal messaging enabled"
   */
  enabledLabel?: string;
  /**
   * Whether to show the label when internal messaging is enabled
   * @default true
   */
  showLabel?: boolean;
}

/**
 * A component that provides a toggle for internal messaging functionality
 * with role-based access control
 */
const InternalMessagesToggle = ({
  userRole,
  allowedRoles = ['agency_member', 'agency_project_manager', 'agency_owner'],
  className = '',
  onStateChange,
  enabledLabel = "Internal messaging enabled",
  showLabel = true
}: InternalMessagesToggleProps) => {
  const [isInternalMessagingEnabled, setIsInternalMessagingEnabled] = useState<boolean>(() => {
    if (!isBrowser()) return false;
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true';
  });
  
  const toastShownRef = useRef(false);
  const isAllowed = allowedRoles.includes(userRole);

  const handleSwitchChange = useCallback(() => {
    if (!isAllowed) return;
    
    setIsInternalMessagingEnabled((prevState) => {
      const newState = !prevState;

      // Show toast only if it hasn't been shown for this state
      if (!toastShownRef.current) {
        if (newState) {
          toast.info('Enabled internal messaging');
        } else {
          toast.info('Disabled internal messaging');
        }
        toastShownRef.current = true;
      }

      if (isBrowser()) {
        localStorage.setItem('internalMessagingEnabled', newState.toString());
      }
      
      // Call the callback if provided
      if (onStateChange) {
        onStateChange(newState);
      }
      
      return newState;
    });
  }, [isAllowed, onStateChange]);

  // Reset the toastShownRef when the state changes
  useEffect(() => {
    toastShownRef.current = false;
  }, [isInternalMessagingEnabled]);

  // Sync state with localStorage
  useEffect(() => {
    if (!isBrowser()) return;
    
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('internalMessagingEnabled');
      setIsInternalMessagingEnabled(savedState === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // If not allowed or not in browser, don't render anything
  if (!isAllowed || !isBrowser()) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleSwitchChange}
        className={
          isInternalMessagingEnabled
            ? 'flex h-9 w-9 flex-shrink-0 items-center justify-center gap-2 p-4 text-gray-700'
            : 'flex h-9 w-9 flex-shrink-0 items-center justify-center gap-2 p-4 text-gray-400'
        }
        aria-label={isInternalMessagingEnabled ? "Disable internal messaging" : "Enable internal messaging"}
      >
        <Switch checked={isInternalMessagingEnabled} />
      </button>
      
      {showLabel && isInternalMessagingEnabled && (
        <span className="text-gray-400">
          {enabledLabel.includes('i18nKey') ? (
            <Trans i18nKey={enabledLabel} />
          ) : (
            enabledLabel
          )}
        </span>
      )}
    </div>
  );
};

/**
 * Hook to use internal messaging functionality
 * @returns Object with isInternalMessagingEnabled, handleSwitchChange, and getInternalMessagingEnabled
 */
export const useInternalMessaging = () => {
  const [isInternalMessagingEnabled, setIsInternalMessagingEnabled] = useState<boolean>(() => {
    if (!isBrowser()) return false;
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true';
  });
  
  const toastShownRef = useRef(false);

  const handleSwitchChange = useCallback(() => {
    setIsInternalMessagingEnabled((prevState) => {
      const newState = !prevState;

      // Show toast only if it hasn't been shown for this state
      if (!toastShownRef.current) {
        if (newState) {
          toast.info('Enabled internal messaging');
        } else {
          toast.info('Disabled internal messaging');
        }
        toastShownRef.current = true;
      }

      if (isBrowser()) {
        localStorage.setItem('internalMessagingEnabled', newState.toString());
      }
      
      return newState;
    });
  }, []);

  // Reset the toastShownRef when the state changes
  useEffect(() => {
    toastShownRef.current = false;
  }, [isInternalMessagingEnabled]);

  // Sync state with localStorage
  useEffect(() => {
    if (!isBrowser()) return;
    
    const handleStorageChange = () => {
      const savedState = localStorage.getItem('internalMessagingEnabled');
      setIsInternalMessagingEnabled(savedState === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Getter function to get the current state
  const getInternalMessagingEnabled = useCallback(() => {
    if (!isBrowser()) return false;
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true';
  }, []);

  return {
    isInternalMessagingEnabled,
    handleSwitchChange,
    getInternalMessagingEnabled,
  };
};

export default InternalMessagesToggle; 