'use client';

import { useCallback, useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import type { Chats } from '~/lib/chats.types';
import type { Message } from '~/lib/message.types';
import type { User } from '~/lib/user.types';
import { useFileUploadActions } from '../../../components/file-preview/hooks/use-file-upload-actions';
import { FileUploadState } from '~/hooks/use-file-upload';

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
 * - Search and filtering functionality
 *
 * @param {UseChatStateProps} props - Hook configuration
 *
 * @example
 * ```tsx
 * const {
 *   chatId,
 *   setMessages,
 *   // ... other values
 * } = useChatState({ initialMembers: [] });
 * ```
 */
export function useChatState({ initialMembers }: UseChatStateProps) {
  // Basic chat state
  const [activeChat, setActiveChat] = useState<Chats.Type | null>(null);
  const chatId = activeChat?.id ?? '';
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

  // File upload actions using the new approach
  const {
    fileUploads,
    handleFile: handleFileUpload,
    handleRemoveFile: handleFileRemove,
  } = useFileUploadActions({
    bucketName: 'chats',
    path: `${chatId}/uploads`,
    onFilesSelected: (uploads: FileUploadState[]) => {
      console.log('Files selected:', uploads);
    },
  });
  return {
    chatId,
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
    fileUploads,
    handleFileUpload,
    handleFileRemove,
  };
}
