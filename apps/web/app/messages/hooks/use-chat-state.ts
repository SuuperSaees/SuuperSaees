'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { FileUploadState, useFileUpload } from '~/hooks/use-file-upload';
import type { Chats } from '~/lib/chats.types';
import type { Message } from '~/lib/message.types';
import type { User } from '~/lib/user.types';

/**
 * Props for the useChatState hook
 */
interface UseChatStateProps {
  /** Initial list of chat members */
  initialMembers: User.Response[];
}

/**
 * Custom hook for managing chat state and operations
 *
 * This hook centralizes chat-related state management including:
 * - Chat selection and active chat state
 * - Member management
 * - Message operations with React Query cache
 * - File uploads for chat attachments
 * - Search and filtering functionality
 *
 * @param {UseChatStateProps} props - Hook configuration
 *
 * @example
 * ```tsx
 * const {
 *   chatId,
 *   setMessages,
 *   handleFileUpload,
 *   // ... other values
 * } = useChatState({ initialMembers: [] });
 * ```
 */
export function useChatState({ initialMembers }: UseChatStateProps) {
  // Basic chat state
  const [chatId, setChatId] = useState<string>('');
  const [activeChat, setActiveChat] = useState<Chats.Type | null>(null);
  const [isChatCreationDialogOpen, setIsChatCreationDialogOpen] =
    useState(false);
  const [members, setMembers] = useState<User.Response[]>(initialMembers ?? []);

  // Search and filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<Chats.TypeWithRelations[]>(
    [],
  );

  // Hooks initialization
  const queryClient = useQueryClient();
  const { upload, uploads } = useFileUpload();

  /**
   * Memoized query key for chat messages
   * Used for React Query cache management
   */
  const messagesQueryKey = useMemo(() => ['chat', chatId], [chatId]);

  /**
   * Updates messages in the React Query cache while preserving other chat data
   *
   * @param updater - New messages array or update function
   */
  const setMessages = useCallback(
    (updater: Message.Type[] | ((prev: Message.Type[]) => Message.Type[])) => {
      queryClient.setQueryData<Chats.TypeWithRelations>(
        messagesQueryKey,
        (oldData) => {
          if (!oldData) return oldData;
          const currentMessages = oldData.messages ?? [];
          const newMessages =
            typeof updater === 'function' ? updater(currentMessages) : updater;
          return {
            ...oldData,
            messages: newMessages,
          };
        },
      );
    },
    [queryClient, messagesQueryKey],
  );

  /**
   * Updates chats in the React Query cache
   *
   * @param updater - New chats data or update function
   */
  const setChats = useCallback(
    (
      updater:
        | Chats.TypeWithRelations[]
        | ((prev: Chats.TypeWithRelations[]) => Chats.TypeWithRelations[]),
    ) => {
      queryClient.setQueryData<Chats.TypeWithRelations[]>(
        ['chats'],
        (oldData) => {
          const currentChats = oldData ?? [];
          return typeof updater === 'function'
            ? updater(currentChats)
            : updater;
        },
      );
    },
    [queryClient],
  );

  /**
   * Handles file uploads for the current chat
   *
   * @param file - The file to upload
   * @param setUploadsFunction - Function to update upload state in the UI
   * @param fileId - Unique identifier for the upload
   * @returns Promise resolving to the uploaded file path
   * @throws Error if no active chat or upload fails
   */
  const handleFileUpload = useCallback(
    async (
      file: File,
      fileId: string,
      setUploads?: React.Dispatch<React.SetStateAction<FileUploadState[]>>,
      config?: {
        bucketName: string;
        path: string;
      },
    ) => {
      if (!chatId) throw new Error('No active chat');

      try {
        const filePath = await upload(file, fileId, {
          bucketName: config?.bucketName ?? 'chats',
          path: config?.path ?? `${chatId}/uploads`,
          onProgress: (progress) => {
            setUploads?.((prev) => {
              const existingUpload = prev.find((u) => u.id === fileId);
              if (!existingUpload) return prev;

              return prev.map((u) =>
                u.id === fileId
                  ? {
                      ...u,
                      progress,
                      status: progress === 100 ? 'success' : 'uploading',
                    }
                  : u,
              );
            });
          },
        });

        return filePath;
      } catch (error) {
        console.error('File upload failed:', error);
        throw error;
      }
    },
    [chatId, upload],
  );

  return {
    chatId,
    setChatId,
    activeChat,
    setActiveChat,
    members,
    setMembers,
    setMessages,
    messagesQueryKey,
    searchQuery,
    setSearchQuery,
    filteredChats,
    setFilteredChats,
    isChatCreationDialogOpen,
    setIsChatCreationDialogOpen,
    setChats,
    handleFileUpload,
    uploads,
  };
}
