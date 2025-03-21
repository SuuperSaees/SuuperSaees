'use client';

import React, { useCallback, useEffect, useRef } from 'react';

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

  // Setup Loom SDK
  const setupLoom = useCallback(async () => {
    try {
      // Check if Loom is supported in the current browser
      const { supported, error: supportError } = isSupported();
      if (!supported) {
        console.warn(`Loom is not supported in this browser: ${supportError}`);
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
      console.error('Loom setup error:', err);
    }
  }, [loomAppId, onAction]);

  // Initialize Loom when the component mounts
  useEffect(() => {
    void setupLoom();
  }, [setupLoom]);

  // If loading, show spinner
  if (isLoading) {
    return <Spinner className="h-5 text-gray-400" />;
  }

  if (!loomAppId || !isSupported()) {
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
