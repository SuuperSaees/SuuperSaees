'use client';

import { useCallback, useMemo, useState } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import { Tabs, TabsContent, TabsList } from '@kit/ui/tabs';
import { TabsTrigger } from '@kit/ui/tabs';

import { Embeds } from '~/lib/embeds.types';
import {
  createEmbed,
  deleteEmbed,
  updateEmbed,
} from '~/server/actions/embeds/embeds.action';

import { EmbedEditor } from './embed-editor/embed-editor';
import { EmbedPreview } from './embed-preview';
import { EmbedTab } from './embed-tab';
import { FormValues } from './schema';

interface EmbedSectionProps {
  embeds: Embeds.TypeWithRelations[];
  agencyId: string;
  userId: string;
  userRole: string;
  defaultCreationValue?: Embeds.Type & {
    embed_accounts: string[];
  };
}

export function EmbedSection({ embeds, agencyId, userId, defaultCreationValue }: EmbedSectionProps) {
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
        <TabsList className="bg-transparent">
          <TabsTrigger value="new" className="group flex items-center gap-2 text-sm transition-colors data-[state=active]:bg-[#F0F0F0] data-[state=inactive]:bg-transparent data-[state=active]:text-gray-600 data-[state=inactive]:text-gray-500">
            <Plus className="h-4 w-4" />
            Add Integration
          </TabsTrigger>
        </TabsList>
        <div className="flex h-full w-full gap-8">
          <div className="flex-1">
            <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
          </div>
          <EmbedEditor onAction={handleEmbedCreation} defaultValue={defaultCreationValue ?? null} />
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
      <TabsList className="bg-transparent">
        <TabsTrigger value="new"   className="group flex items-center gap-2 text-sm transition-colors data-[state=active]:bg-[#F0F0F0] data-[state=inactive]:bg-transparent data-[state=active]:text-gray-600 data-[state=inactive]:text-gray-500">
          <Plus className="h-4 w-4" />
          Add Integration
        </TabsTrigger>
        {formattedEmbeds.map((embed) => (
          <EmbedTab
            key={embed.id}
            embed={embed}
            isActive={embed.id === activeEmbedId}
            onDelete={handleDeleteEmbed}
          />
        ))}
      </TabsList>

      <div className="flex h-full w-full gap-8">
        {/* New Integration Tab Content */}
        <TabsContent value="new" className="h-full w-full">
          <div className="flex h-full w-full gap-8">
            <div className="flex-1">
              <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
            </div>
            <EmbedEditor onAction={handleEmbedCreation} defaultValue={null} />
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
                />
              )}
            </div>
          </TabsContent>
        ))}
      </div>
    </Tabs>
  );
}
