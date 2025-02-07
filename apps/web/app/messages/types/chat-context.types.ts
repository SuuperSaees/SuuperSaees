import { Dispatch, SetStateAction, ReactNode } from 'react'
import { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { ChatMembers } from '~/lib/chat-members.types'
import { ChatMessages } from '~/lib/chat-messages.types'
import { Chats } from '~/lib/chats.types'
import { Message } from '~/lib/message.types'
import { User } from '~/lib/user.types'
import { AddMembersResponse } from '~/server/actions/chat-members/chat-members.interface'
import { DeleteMessageResponse } from '~/server/actions/chat-messages/chat-messages.interface'
import { GetChatByIdResponse } from '~/server/actions/chats/chats.interface'

/**
 * Interface for managing the active chat state
 * @interface ActiveChatState
 * @property {string | null} activeChat - ID of the currently active chat
 * @property {Function} setActiveChat - Function to update the active chat ID
 * @property {Chats.Type | null} activeChatData - Data of the currently active chat
 * @property {Function} setActiveChatData - Function to update the active chat data
 */
export interface ActiveChatState {
  chatId: string
  setChatId: Dispatch<SetStateAction<string>>
  activeChat: Chats.Type | null
  setActiveChat: Dispatch<SetStateAction<Chats.Type | null>>
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
  messages: Message.Type[]
  setMessages: Dispatch<SetStateAction<Message.Type[]>>
  members: ChatMembers.Type[]
  setMembers: Dispatch<SetStateAction<ChatMembers.Type[]>>
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
      content: string
      fileIds?: string[]
      userId: string
      temp_id: string
    },
    {
      previousMessages: Message.Type[]
    }
  >
  /** Mutation for deleting messages */
  deleteMessageMutation: UseMutationResult<

    DeleteMessageResponse,
    Error,
    string,
    {
      previousMessages: Message.Type[]
    }
  >
  /** Mutation for updating chat details */
  updateChatMutation: UseMutationResult<Chats.Update, Error, string>
  /** Mutation for deleting entire chat */
  deleteChatMutation: UseMutationResult<void, Error, void>
  /** Mutation for creating new chat */
  createChatMutation: UseMutationResult<Chats.Insert, Error, {name: string, memberIds: string[]}>
  /** Mutation for updating chat members */
  membersUpdateMutation: UseMutationResult<AddMembersResponse, Error, string[]>

}

/**
 * Interface containing all chat-related queries
 * @interface ChatQueries
 */
export interface ChatQueries {
  /** Query for fetching all chats */
  chatsQuery: UseQueryResult<Chats.Type[], Error>
  /** Query for fetching specific chat by ID */
  chatByIdQuery: UseQueryResult<GetChatByIdResponse, Error>
}

/**
 * Main chat context type that combines all chat-related interfaces
 * @interface ChatContextType
 * @extends {ActiveChatState}
 * @extends {MessagesState}
 * @extends {ChatMutations}
 * @extends {ChatQueries}
 */
export interface ChatContextType extends ActiveChatState, MessagesState, ChatMutations, ChatQueries {
  user: User.Response
}

/**
 * Props interface for ChatProvider component
 * @interface ChatProviderProps
 */
export interface ChatProviderProps {
  children: ReactNode
  // chatId: string
  initialChat?: GetChatByIdResponse
  initialMembers?: ChatMembers.Type[]
}

