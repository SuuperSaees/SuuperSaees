import { useQuery } from '@tanstack/react-query';
import { Video } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { setup } from "@loomhq/record-sdk";
import { isSupported } from "@loomhq/record-sdk/is-supported";
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { getOrganization } from '~/team-accounts/src/server/actions/organizations/get/get-organizations';

interface LoomRecordButtonProps {
  setCustomEditorText?: (text: string) => void;
}

function LoomRecordButton({setCustomEditorText}: LoomRecordButtonProps) {
  const [loomAppId, setLoomAppId] = useState<string>('');
  const [buttonName, setButtonName] = useState<string>('');
  const {user} = useUserWorkspace();
  const currentUserId = user?.id;


  const { data: getOrganizationData, error: getOrganizationError } = useQuery({
    queryKey: ['account-settings', currentUserId],
    queryFn: async () => await getOrganization(),
    enabled: !!currentUserId,
  });

  const setupLoom = useCallback(async (buttonName: string, loomAppId: string) => {
    const { supported, error } = isSupported();
    if (!supported) {
      console.warn(`Error setting up Loom: ${error}`);
      return;
    }

    const button = document.getElementById(buttonName);

    if (!button) {
      console.warn('Button element not found');
      return;
    }

    const { configureButton } = await setup({
      publicAppId: loomAppId,
    });

    const sdkButton = configureButton({ element: button });
    sdkButton.on("insert-click", (video) => {
      setCustomEditorText?.(video.sharedUrl)
    });
  }, []);

  useEffect(() => { 
    if (getOrganizationData) {
      const newLoomAppId = getOrganizationData.loom_app_id ?? '';
      const newButtonName = `loom-${currentUserId}`;
      setLoomAppId(newLoomAppId);
      setButtonName(newButtonName);
    }
  }, [getOrganizationData, getOrganizationError, currentUserId]);

  useEffect(() => {
    if (loomAppId && buttonName) {
      const button = document.getElementById(buttonName);
      if (button) {
        setupLoom(buttonName, loomAppId).catch(console.error);
      } else {
        console.warn('Button element not found');
      }
    }
  }, [loomAppId, buttonName, setupLoom]);

  if (!loomAppId) {
    return null;
  }

  return (
    <button id={buttonName}>
      <Video className='h-5 text-gray-400' strokeWidth={1.5} />
    </button>
  );
}

export default LoomRecordButton;

