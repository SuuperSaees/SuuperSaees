import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

const useInternalMessaging = () => {
  const [isInternalMessagingEnabled, setIsInternalMessagingEnabled] = useState(() => {
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true'; 
  });
  const [userRole, setUserRole] = useState('');
  const toastShownRef = useRef(false); // Ref to track if toast has been shown

  const handleSwitchChange = useCallback(() => {
    setIsInternalMessagingEnabled(prevState => {
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


  useEffect(() => {
    const fetchUserRole = async () => {
        await getUserRole().then((data)=> {
          setUserRole(data);
        }).catch((error) => {
          console.error('Error al obtener el rol del usuario:', error);
        })
      };

    void fetchUserRole();
}, []);

 // Reset the toastShownRef when the state changes
 useEffect(() => {
  toastShownRef.current = false; // Reset the ref when the state changes
}, [isInternalMessagingEnabled])

  return {
    isInternalMessagingEnabled,
    handleSwitchChange,
    userRole,
  };
};

export default useInternalMessaging;