'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { toast } from 'sonner';

import { isBrowser } from '@kit/shared/utils';

const useInternalMessaging = () => {

  const [isInternalMessagingEnabled, setIsInternalMessagingEnabled] = useState(
    () => {
      const savedState = localStorage.getItem('internalMessagingEnabled');
      return savedState === 'true';
    },
  );
  const toastShownRef = useRef(false); // Ref to track if toast has been shown

  const handleSwitchChange = useCallback(() => {
    setIsInternalMessagingEnabled((prevState) => {
      const newState = !prevState; // Toggle the state

      // Show toast only if it hasn't been shown for this state
      if (!toastShownRef.current) {
        if (newState) {
          toast.info('Enabled internal messaging');
        } else {
          toast.info('Disabled internal messaging');
        }
        toastShownRef.current = true; // Set the ref to true to prevent further toasts
      }

      localStorage.setItem('internalMessagingEnabled', newState.toString());
      return newState; // Return the new state
    });
  }, []);

  // Reset the toastShownRef when the state changes
  useEffect(() => {
    toastShownRef.current = false; // Reset the ref when the state changes
  }, [isInternalMessagingEnabled]);

  // Sync state with localStorage
  useEffect(() => {
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
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true';
  }, []);

  if(!isBrowser()) {
    return {
      isInternalMessagingEnabled: false,
      handleSwitchChange: () => false,
      getInternalMessagingEnabled: () => false,
    };
  }
  return {
    isInternalMessagingEnabled,
    handleSwitchChange,
    getInternalMessagingEnabled,
  };
};

export default useInternalMessaging;
