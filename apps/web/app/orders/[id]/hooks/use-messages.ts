import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getUserRole } from 'node_modules/@kit/team-accounts/src/server/actions/members/get/get-member-account';

const useInternalMessaging = () => {
  const [isInternalMessagingEnabled, setIsInternalMessagingEnabled] = useState(() => {
    const savedState = localStorage.getItem('internalMessagingEnabled');
    return savedState === 'true'; 
  });
  const [userRole, setUserRole] = useState('');

  const handleSwitchChange = () => {
    if (isInternalMessagingEnabled) {
        toast.info('Enabled internal messaging'); 
      } else {
        toast.info('Disabled internal messaging'); 
      }
    setIsInternalMessagingEnabled(!isInternalMessagingEnabled);
    localStorage.setItem('internalMessagingEnabled', (!isInternalMessagingEnabled).toString());
  };


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

  return {
    isInternalMessagingEnabled,
    handleSwitchChange,
    userRole,
  };
};

export default useInternalMessaging;