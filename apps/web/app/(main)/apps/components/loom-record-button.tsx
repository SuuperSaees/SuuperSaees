'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { setup } from '@loomhq/record-sdk';
import { isSupported } from '@loomhq/record-sdk/is-supported';
import { Video } from 'lucide-react';

import { Spinner } from '@kit/ui/spinner';

export interface LoomRecordButtonProps {
  /**
   * The Loom App ID to use for recording (required)
   */
  loomAppId: string;

  /**
   * Callback function that receives the Loom video URL when a recording is inserted
   */
  onAction?: (videoUrl: string) => void;

  /**
   * Optional CSS class name for styling
   */
  className?: string;

  /**
   * Optional loading state
   */
  isLoading?: boolean;
}

/**
 * A button component that integrates with Loom's recording SDK
 *
 * This component allows users to record and share Loom videos directly in the application.
 * It handles the setup and configuration of the Loom SDK and provides a button interface.
 */
function LoomRecordButton({
  loomAppId,
  onAction,
  className = '',
  isLoading = false,
}: LoomRecordButtonProps) {
  const buttonId = `loom-${loomAppId}`;
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [setupFailed, setSetupFailed] = useState(false);

  // Setup Loom SDK
  const setupLoom = useCallback(async () => {
    try {
      setSetupFailed(false); // Reset on new attempt
      // Check if Loom is supported in the current browser
      const { supported, error: supportError } = isSupported();
      if (!supported) {
        console.warn(`Loom is not supported in this browser: ${supportError}`);
        setSetupFailed(true);
        return;
      }
      if (!loomAppId) {
        setSetupFailed(true);
        return;
      }
      // Configure the Loom SDK
      const { configureButton } = await setup({
        publicAppId: loomAppId,
      });
      // Configure the button and set up the insert event handler
      if (buttonRef.current) {
        const sdkButton = configureButton({ element: buttonRef.current });
        sdkButton.on('insert-click', (video) => {
          if (onAction && video.sharedUrl) {
            onAction(video.sharedUrl);
          }
        });
      }
    } catch (err) {
      setSetupFailed(true);
      console.error('Loom setup error:', err);
    }
  }, [loomAppId, onAction]);

  // Initialize Loom when the component mounts or loomAppId changes
  useEffect(() => {
    if (!loomAppId || setupFailed) return;
    void setupLoom();
    // Only retry if loomAppId changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loomAppId]);

  // If loading, show spinner
  if (isLoading) {
    return <Spinner className="h-5 text-gray-400" />;
  }

  if (!loomAppId || !isSupported() || setupFailed) {
    return null;
  }

  return (
    <button
      ref={buttonRef}
      id={buttonId}
      className={`flex items-center justify-center ${className}`}
      title="Record Loom video"
      type="button"
    >
      <Video className="h-6 w-6 text-gray-400" strokeWidth={1.5} />
    </button>
  );
}

export default LoomRecordButton;
