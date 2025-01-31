'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ChatEmptyState from './chat-empty-state';
import { getChatById, deleteChat, updateChat } from '~/server/actions/chat/actions/chats/chat.actions';
import { useChat } from './context/chat-context';
import EditableHeader from '~/components/editable-header';
import { EllipsisVertical, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { toast } from 'sonner';

export default function ChatThread() {
  const [message, setMessage] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const queryClient = useQueryClient();
  const { activeChat, activeChatData } = useChat();

  // Efecto para manejar cambios en el chat activo
  useEffect(() => {
    if (activeChat) {
      void queryClient.invalidateQueries({ queryKey: ['chat', activeChat] }  );
      void queryClient.prefetchQuery({ queryKey: ['chat', activeChat], queryFn: async () => {
        const response = await getChatById(activeChat);
        if (!response.success) throw new Error(response.error?.message ?? 'Unknown error');
        return response.success.data;
      }});
    }
  }, [activeChat, queryClient]);

  // Mutación para eliminar chat
  const deleteChatMutation = useMutation({
    mutationFn: async () => await deleteChat(activeChatData?.id.toString() ?? ''),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  });

  // Query para obtener datos del chat
  const { data: chatData, isLoading } = useQuery({
    queryKey: ['chat', activeChat],
    queryFn: async () => {
      if (!activeChat) return null;
      const response = await getChatById(activeChat);
      if (!response.success) throw new Error(response.error?.message ?? 'Unknown error');
      return response.success.data;
    },
    enabled: !!activeChat,
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false
  });

  // Manejadores de eventos
  const handleDelete = () => {
    deleteChatMutation.mutate();
  };

  const handleUpdate = async (value: string) => {
    try {
      await updateChat({
        id: Number(activeChatData?.id),
        name: value,
      });
      void queryClient.invalidateQueries({ queryKey: ['chats'] });
      toast.success('Success', {
        description: 'Chat name updated',
      });
    } catch (error) {
      console.error('Error updating chat name:', error);
      toast.error('Error', {
        description: 'Error updating chat name',
      });
    }
  };

  // Renderizado condicional
  if (!activeChat || !activeChatData) {
    return <ChatEmptyState />;
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <span>Loading chat...</span>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <EditableHeader
            initialName={activeChatData.name}
            id={activeChatData.id.toString()}
            userRole={'agency_owner'}
            updateFunction={handleUpdate}
            rolesThatCanEdit={new Set(['agency_owner'])}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Popover open={isPopupOpen} onOpenChange={setIsPopupOpen}>
              <PopoverTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-full">
                  <EllipsisVertical className="w-5 h-5" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0" align="end">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2" 
                  onClick={() => {
                    setIsPopupOpen(false);
                    handleDelete();
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar chat
                </Button>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {/* Aquí irían los mensajes del chat */}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <button
            onClick={() => console.log('Attach file')}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
          </button>
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}