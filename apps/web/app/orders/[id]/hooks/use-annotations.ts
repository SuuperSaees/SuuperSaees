import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Annotation {
  id: string;
  file_id: string;
  user_id: string;
  position_x: number;
  position_y: number;
  status: 'active' | 'completed' | 'draft';
  page_number?: number;
  number: number;
  message_id?: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id?: string;
}

export const useAnnotations = (fileId: string, isDialogOpen: boolean) => {
  const { t } = useTranslation('orders');
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

  const { data: annotations = [], isLoading: isLoadingAnnotations } = useQuery({
    queryKey: ['annotations', fileId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/annotations?file_id=${fileId}`);
      const data = await response.json();
      const annotations = data.data.current_file.filter((annotation: Annotation) => annotation.deleted_on === null);
      return annotations ?? [];
    },
    enabled: isDialogOpen && Boolean(fileId),
  });


  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedAnnotation?.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/annotations/${selectedAnnotation?.id}`);
      const data = await response.json();
      return data.data.children ?? [];
    },
    enabled: isDialogOpen && Boolean(selectedAnnotation?.id),
  });

  // Replace createAnnotation with mutation
  const createAnnotationMutation = useMutation({
    mutationFn: async ({
      file_id,
      position_x,
      position_y,
      content,
      user_id,
      page_number
    }: {
      file_id: string;
      position_x: number;
      position_y: number;
      content: string;
      user_id: string;
      page_number?: number;
    }) => {
      const response = await fetch('/api/v1/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_id,
          user_id,
          position_x,
          position_y,
          page_number,
          content,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', fileId] });
      toast.success(t('annotations.addSuccess'));
    },
    onError: () => {
      toast.error(t('annotations.addError'));
    },
  });

  // Replace addMessage with mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({
      parent_id,
      content,
      user_id,
    }: {
      parent_id: string;
      content: string;
      user_id: string;
    }) => {
      const response = await fetch('/api/v1/annotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parent_id, content, user_id }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedAnnotation?.id] });
    },
  });

  // Add the mutation after the existing ones
  const deleteAnnotationMutation = useMutation({
    mutationFn: async (annotationId: string) => {
      const response = await fetch(`/api/v1/annotations/${annotationId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', fileId] });
    },
  });

  const updateAnnotationMutation = useMutation({
    mutationFn: async ({
      annotationId,
      status,
      first_message,
      message_id
    }: {
      annotationId: string;
      status: 'completed' | 'draft' | 'active';
      first_message?: string;
      message_id?: string;
    }) => {
      const response = await fetch(`/api/v1/annotations/${annotationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          first_message,
          message_id
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedAnnotation?.id] });
      queryClient.invalidateQueries({ queryKey: ['annotations', fileId] });
    },
    onError: () => {
      console.error('Error updating annotation');
    },
  });

  const handleDatabaseChange = useCallback(
    (payload: { 
      eventType: string; 
      new: Annotation | Message; 
      old: Annotation | Message;
      table: string;
    }) => {
      const { eventType, new: newRecord, old: oldRecord, table } = payload;

      if (table === 'annotations') {
        queryClient.setQueryData(
          ['annotations', fileId],
          (oldAnnotations: Annotation[] | undefined) => {
            if (!oldAnnotations) return [];

            switch (eventType) {
              case 'INSERT':
                return [...oldAnnotations, newRecord as Annotation];
              case 'UPDATE':
                return oldAnnotations.map((annotation) =>
                  annotation.id === newRecord.id ? (newRecord as Annotation) : annotation
                );
              case 'DELETE':
                return oldAnnotations.filter(
                  (annotation) => annotation.id !== oldRecord.id
                );
              default:
                return oldAnnotations;
            }
          }
        );
      } else if (table === 'messages' && selectedAnnotation?.id) {
        queryClient.setQueryData(
          ['messages', selectedAnnotation.id],
          (oldMessages: Message[] | undefined) => {
            if (!oldMessages) return [];

            switch (eventType) {
              case 'INSERT':
                return [...oldMessages, newRecord as Message];
              case 'UPDATE':
                return oldMessages.map((message) =>
                  message.id === newRecord.id ? (newRecord as Message) : message
                );
              case 'DELETE':
                return oldMessages.filter(
                  (message) => message.id !== oldRecord.id
                );
              default:
                return oldMessages;
            }
          }
        );
      }
    },
    [queryClient, fileId, selectedAnnotation?.id]
  );

  useEffect(() => {
    const channel = supabase
      .channel('database_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'annotations', filter: `file_id=eq.${fileId}` },
        (payload) => handleDatabaseChange({ ...payload, table: 'annotations' })
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: `parent_id=eq.${selectedAnnotation?.id}` },
        (payload) => handleDatabaseChange({ ...payload, table: 'messages' })
      )
      .subscribe();

    return () => {
      void channel.unsubscribe();
    };
  }, [supabase, fileId, selectedAnnotation?.id, handleDatabaseChange]);

  return {
    annotations,
    messages,
    isLoadingAnnotations,
    isLoadingMessages,
    createAnnotation: createAnnotationMutation.mutateAsync,
    addMessage: addMessageMutation.mutateAsync,
    deleteAnnotation: deleteAnnotationMutation.mutateAsync,
    updateAnnotation: updateAnnotationMutation.mutateAsync,
    isCreatingAnnotation,
    setIsCreatingAnnotation,
    selectedAnnotation,
    setSelectedAnnotation,
  };
}; 