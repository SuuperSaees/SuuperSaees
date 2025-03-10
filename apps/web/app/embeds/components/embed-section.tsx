'use client';

import { useCallback, useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { TabsContent } from '@kit/ui/tabs';
import { Tabs } from '@kit/ui/tabs';

import { Embeds } from '~/lib/embeds.types';
import {
  createEmbed,
  deleteEmbed,
  updateEmbed,
} from '~/server/actions/embeds/embeds.action';

import { EmbedPreview } from './embed-preview';
import { FormValues } from '../schema';
import { EmbedEditor } from './embed-editor/embed-editor';
import { EmbedTabs } from './embed-tabs';

interface EmbedSectionProps {
  embeds: Embeds.TypeWithRelations[];
  agencyId: string;
  userId: string;
  userRole: string;
  defaultCreationValue?: Embeds.Type & {
    embed_accounts: string[];
  };
  showEmbedSelector?: boolean;
}

export function EmbedSection({ 
  embeds, 
  agencyId, 
  userId, 
  defaultCreationValue,
  showEmbedSelector = false
}: EmbedSectionProps) {
  const queryClient = useQueryClient();

  const formattedEmbeds = useMemo(() => {
    return embeds.map((embed) => ({
      ...embed,
      embed_accounts:
        embed.organizations?.map((organization) => organization.id) ?? [],
    }));
  }, [embeds]);

  // Find the first iframe embed to use as default active tab
  const defaultEmbed = useMemo(
    () =>
      formattedEmbeds.find((embed) => embed.type === 'iframe') ??
      formattedEmbeds[0] ??
      null,
    [formattedEmbeds],
  );

  const [activeEmbedId, setActiveEmbedId] = useState<string>(
    defaultEmbed?.id ?? 'new',
  );

  // Filter embeds to only show iframe types in the tab content
  // const iframeEmbeds = useMemo(
  //   () => formattedEmbeds.filter((embed) => embed.type === 'iframe'),
  //   [formattedEmbeds],
  // );

  // Create mutation
  const createMutation = useMutation<Embeds.Type, Error, FormValues>({
    mutationFn: (values: FormValues) => {
      const { embed_accounts, ...embedData } = values;
      const embed = {
        ...embedData,
        organization_id: agencyId,
        user_id: userId,
      };
      return createEmbed(embed, embed_accounts);
    },
    onSuccess: () => {
      toast.success('Integration created successfully');
      void queryClient.invalidateQueries({ queryKey: ['embeds'] });
      setActiveEmbedId(defaultEmbed?.id ?? 'new');
    },
    onError: (error: Error) => {
      toast.error('Failed to create integration: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation<
    Embeds.Type,
    Error,
    { id: string; values: FormValues }
  >({
    mutationFn: ({ id, values }) => {
      const { embed_accounts: _embed_accounts, ...embedData } = values;
      const embed = {
        ...embedData,
      };
      return updateEmbed(id, embed, _embed_accounts);
    },
    onSuccess: () => {
      toast.success('Integration updated successfully');
      void queryClient.invalidateQueries({ queryKey: ['embeds'] });
    },
    onError: (error: Error) => {
      toast.error('Failed to update integration: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteEmbed(id),
  });

  const handleDeleteEmbed = useCallback(
    (id: string) => {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Integration deleted successfully');
        },
      });
    },
    [deleteMutation],
  );

  const handleTabChange = useCallback((tabId: string) => {
    setActiveEmbedId(tabId);
  }, []);

  const handleEmbedCreation = useCallback(
    async (values: FormValues) => {
      try {
        await createMutation.mutateAsync(values);
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error('Failed to create embed:', error);
      }
    },
    [createMutation],
  );

  const handleEmbedUpdate = useCallback(
    async (values: FormValues) => {
      if (activeEmbedId === 'new') return;
      try {
        await updateMutation.mutateAsync({ id: activeEmbedId, values });
      } catch (error) {
        // Error is handled by the mutation's onError
        console.error('Failed to update embed:', error);
      }
    },
    [activeEmbedId, updateMutation],
  );

  // No embeds to display - still show the "Add Integration" tab
  if (embeds.length === 0) {
    return (
      <Tabs
        value={activeEmbedId}
        onValueChange={handleTabChange}
        className="h-full w-full text-gray-500"
      >
        <EmbedTabs
          embeds={[]}
          activeEmbedId={activeEmbedId}
          onDeleteEmbed={handleDeleteEmbed}
        />
        <div className="flex h-full w-full gap-8">
          <div className="flex-1">
            <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
          </div>
          <EmbedEditor 
            onAction={handleEmbedCreation} 
            defaultValue={defaultCreationValue ?? null} 
            availableEmbeds={formattedEmbeds}
            showEmbedSelector={showEmbedSelector}
          />
        </div>
      </Tabs>
    );
  }

  return (
    <Tabs
      value={activeEmbedId}
      onValueChange={handleTabChange}
      className="h-full w-full text-gray-500"
    >
      <EmbedTabs
        embeds={formattedEmbeds}
        activeEmbedId={activeEmbedId}
        onDeleteEmbed={handleDeleteEmbed}
      />
      <div className="flex h-full w-full gap-8">
        {/* New Integration Tab Content */}
        <TabsContent value="new" className="h-full w-full">
          <div className="flex h-full w-full gap-8">
            <div className="flex-1">
              <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
            </div>
            <EmbedEditor 
              onAction={handleEmbedCreation} 
              defaultValue={defaultCreationValue ?? null} 
              availableEmbeds={formattedEmbeds}
              showEmbedSelector={showEmbedSelector}
            />
          </div>
        </TabsContent>

        {/* Only render TabsContent for iframe embeds */}
        {formattedEmbeds.map((embed) => (
          <TabsContent
            key={embed.id}
            value={embed.id}
            className="h-full w-full"
          >
            <div className="flex h-full w-full gap-8">
              <div className="flex-1">
                <EmbedPreview embedSrc={embed.value} />
              </div>
              {activeEmbedId === embed.id && (
                <EmbedEditor
                  onAction={handleEmbedUpdate}
                  defaultValue={embed}
                  availableEmbeds={formattedEmbeds.filter(e => e.id !== embed.id)}
                  showEmbedSelector={false}
                />
              )}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
