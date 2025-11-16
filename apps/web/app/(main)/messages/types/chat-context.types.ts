import { Dispatch, ReactNode, SetStateAction } from "react";

import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";

import { FileUploadState } from "~/hooks/use-file-upload";
import { ChatMembers } from "~/lib/chat-members.types";
import { ChatMessages } from "~/lib/chat-messages.types";
import { Chats } from "~/lib/chats.types";
import { File } from "~/lib/file.types";
import { Message } from "~/lib/message.types";
import { User } from "~/lib/user.types";

/**
 * Interface for managing the active chat state
 * @interface ActiveChatState
 * @property {string | null} activeChat - ID of the currently active chat
 * @property {Function} setActiveChat - Function to update the active chat ID
 * @property {Chats.Type | null} activeChatData - Data of the currently active chat
 * @property {Function} setActiveChatData - Function to update the active chat data
 */
export interface ActiveChatState {
  chatId: string;
  setChatId: Dispatch<SetStateAction<string>>;
  activeChat: Chats.Type | null;
  setActiveChat: Dispatch<SetStateAction<Chats.Type | null>>;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  filteredChats: Chats.TypeWithRelations[];
  setFilteredChats: Dispatch<SetStateAction<Chats.TypeWithRelations[]>>;
  isChatCreationDialogOpen: boolean;
  setIsChatCreationDialogOpen: Dispatch<SetStateAction<boolean>>;
  setChats:
    | Dispatch<SetStateAction<Chats.TypeWithRelations[]>>
    | ((
        updater:
          | Chats.TypeWithRelations[]
          | ((prev: Chats.TypeWithRelations[]) => Chats.TypeWithRelations[]),
      ) => void);
  fileUploads: FileUploadState[];
  handleFileUpload: (
    file: File,
    onComplete?: (upload: FileUploadState) => void,
  ) => Promise<void>;
  handleFileRemove: (id: string) => void;
}

/**
 * Interface for managing messages and members state
 * @interface MessagesState
 * @property {Message.Type[]} messages - Array of chat messages
 * @property {Function} setMessages - Function to update messages
 * @property {ChatMembers.Type[]} members - Array of chat members
 * @property {Function} setMembers - Function to update members
 */
export interface MessagesState {
  messages: Message.Type[];
  setMessages: Dispatch<SetStateAction<Message.Type[]>>;
  members: User.Response[];
  setMembers: Dispatch<SetStateAction<User.Response[]>>;
}

/**
 * Interface containing all chat-related mutations
 * @interface ChatMutations
 */
export interface ChatMutations {
  /** Mutation for adding new messages */
  addMessageMutation: UseMutationResult<
    ChatMessages.TypeWithRelations,
    Error,
    {
      message: Message.Insert;
      files?: File.Insert[];
    },
    {
      previousMessages: Message.Type[];
    }
  >;
  /** Mutation for deleting messages */
  deleteMessageMutation: UseMutationResult<
    void,
    Error,
    {
      chatId?: string;
      messageId?: string;
    },
    {
      previousMessages: Message.Type[];
    }
  >;
  /** Mutation for updating chat details */
  updateChatMutation: UseMutationResult<Chats.Update, Error, string>;
  /** Mutation for deleting entire chat */
  deleteChatMutation: UseMutationResult<void, Error, string>;
  /** Mutation for creating new chat */
  createChatMutation: UseMutationResult<
    Chats.Insert,
    Error,
    {
      name: string;
      memberIds: string[];
      clientOrganizationId: string;
      agencyId: string;
    }
  >;
  /** Mutation for updating chat members */
  membersUpdateMutation: UseMutationResult<
    ChatMembers.TypeWithRelations[],
    Error,
    {
      selectedUserIds: string[];
      agencyMembers: { id: string; role: string }[];
    },
    unknown
  >;
}

/**
 * Interface containing all chat-related queries
 * @interface ChatQueries
 */
export interface ChatQueries {
  /** Query for fetching all chats */
  chatsQuery: UseQueryResult<Chats.Type[], Error>;
  /** Query for fetching specific chat by ID */
  chatByIdQuery: UseQueryResult<Chats.TypeWithRelations, Error>;
}

/**
 * Main chat context type that combines all chat-related interfaces
 * @interface ChatContextType
 * @extends {ActiveChatState}
 * @extends {MessagesState}
 * @extends {ChatMutations}
 * @extends {ChatQueries}
 */
export interface ChatContextType
  extends ActiveChatState,
    MessagesState,
    ChatMutations,
    ChatQueries {
  user: User.Response & { role: string };
}

/**
 * Props interface for ChatProvider component
 * @interface ChatProviderProps
 */
export interface ChatProviderProps {
  children: ReactNode;
  // chatId: string
  initialChat?: Chats.TypeWithRelations;
  initialChats?: Chats.TypeWithRelations[];
  initialMembers?: User.Response[];
}
