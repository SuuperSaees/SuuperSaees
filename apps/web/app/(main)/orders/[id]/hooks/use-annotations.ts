import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { Activity } from '~/lib/activity.types';
import { addActivityAction } from '~/team-accounts/src/server/actions/activity/create/create-activity';
import { useActivityContext } from '../context/activity-context';
import { Annotation } from '~/lib/annotations.types';

const NEXT_PUBLIC_SUUPER_CLIENT_ID = process.env.NEXT_PUBLIC_SUUPER_CLIENT_ID;
const NEXT_PUBLIC_SUUPER_CLIENT_SECRET = process.env.NEXT_PUBLIC_SUUPER_CLIENT_SECRET;

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  parent_id?: string;
}

interface useAnnotationsProps {
  fileId: string;
  fileName: string;
  isDialogOpen: boolean;
  isInitialMessageOpen?: boolean;
  otherFileIds?: string[];
}

export const useAnnotations = ({ fileId, fileName, isDialogOpen, isInitialMessageOpen=false, otherFileIds }: useAnnotationsProps) => {
  const { t } = useTranslation('orders');
  const supabase = useSupabase();
  const { user, workspace } = useUserWorkspace();
  const { order } = useActivityContext();
  const queryClient = useQueryClient();
  const [isCreatingAnnotation, setIsCreatingAnnotation] = useState(true);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation.Type | null>(null);

  const { data: annotations = [], isLoading: isLoadingAnnotations } = useQuery({
    queryKey: ['annotations', fileId],
    queryFn: async () => {
      const response = await fetch(`/api/v1/annotations?file_id=${fileId}&other_file_ids=${otherFileIds?.join(',')}`, {
        headers: new Headers({
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
      });
      const data = await response.json();
      const currentAnnotations = data.data.current_file.filter((annotation: Annotation.Type) => annotation.deleted_on === null);
      const allAnnotations = data.data.other_files.filter((annotation: Annotation.Type) => annotation.deleted_on === null);
      return [...currentAnnotations, ...allAnnotations] ?? [];
    },
    enabled: isDialogOpen,
  });


  const { data: messages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedAnnotation?.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/annotations/${selectedAnnotation?.id}`, {
        headers: new Headers({
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
      });
      const data = await response.json();
      return data.data.children ?? [];
    },
    enabled: isDialogOpen && Boolean(selectedAnnotation?.id) && !isInitialMessageOpen,
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
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
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
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
      const actualName = workspace?.name;

      const message = `has added a new annotation`;
      const activity = {
        actor: actualName,
        action: Activity.Enums.ActionType.CREATE,
        type: Activity.Enums.ActivityType.ANNOTATION,
        message,
        value: [fileName, fileId],
        preposition: 'in_file',
        order_id: Number(order.id),
        user_id: user?.id,
      };
      await addActivityAction(activity);
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
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
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
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
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
        headers: new Headers({
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${NEXT_PUBLIC_SUUPER_CLIENT_ID}:${NEXT_PUBLIC_SUUPER_CLIENT_SECRET}`)}`,
        }),
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
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
    onError: () => {
      console.error('Error updating annotation');
    },
  });

  const handleDatabaseChange = useCallback(
    (payload: { 
      eventType: string; 
      new: Annotation.Type | Message; 
      old: Annotation.Type | Message;
      table: string;
    }) => {
      const { eventType, new: newRecord, old: oldRecord, table } = payload;

      if (table === 'annotations') {
        queryClient.setQueryData(
          ['annotations', fileId],
          (oldAnnotations: Annotation.Type[] | undefined) => {
            if (!oldAnnotations) return [];

            switch (eventType) {
              case 'INSERT':
                return [...oldAnnotations, newRecord as Annotation.Type];
              case 'UPDATE':
                return oldAnnotations.map((annotation) =>
                  annotation.id === newRecord.id ? (newRecord as Annotation.Type) : annotation
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