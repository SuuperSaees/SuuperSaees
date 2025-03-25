'use client';
import { useState } from 'react';
import { Star, StarOff } from 'lucide-react';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

interface ButtonPinOrganizationProps {
  organizationId: string;
}

export default function ButtonPinOrganization({
  organizationId,
}: ButtonPinOrganizationProps) {
  const { pinned_organizations, updateOrganizationSetting } = useOrganizationSettings();
  
  // Parse pinned organizations from string to array
  const pinnedOrganizationsArray = pinned_organizations
    ? (JSON.parse(pinned_organizations) as string[])
    : [];
  
  // Check if current organization is pinned
  const [isPinned, setIsPinned] = useState(pinnedOrganizationsArray.includes(organizationId));
  
  const handleTogglePin = () => {
    let updatedPinnedOrgs: string[];
    setIsPinned(!isPinned);

    if (isPinned) {
      // Remove organization from pinned list
      updatedPinnedOrgs = pinnedOrganizationsArray.filter(id => id !== organizationId);
    } else {
      // Add organization to pinned list
      updatedPinnedOrgs = [...pinnedOrganizationsArray, organizationId];
    }
    
    // Update the setting
    updateOrganizationSetting.mutateAsync({
      key: 'pinned_organizations',
      value: JSON.stringify(updatedPinnedOrgs),
    }).catch(() => {
      setIsPinned(isPinned);
    });

  };
  
  return (
    <button 
      className='flex items-center gap-2' 
      onClick={handleTogglePin}
      title={isPinned ? 'Unpin organization' : 'Pin organization'}
    >
      {isPinned ? (
       <StarOff className='w-4 h-4 text-slate-500' />
      ) : (
        <Star className='w-4 h-4 text-slate-500' />
      )}
    </button>
  );
};
