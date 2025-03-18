'use client';

import { useMemo, useState } from 'react';

import { TabsContent } from '@kit/ui/tabs';
import { Tabs } from '@kit/ui/tabs';

import { Embeds } from '~/lib/embeds.types';
import { useEmbedApiActions, useEmbedUrlParams } from '../hooks';
import { FormValues } from '../schema';

import { EmbedPreview } from './embed-preview';
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
  queryKey?: string[];
  externalTabControl?: boolean;
  activeEmbedId?: string;
}

// Helper function to convert FormValues to the expected EmbedEditor defaultValue type
const formValuesToEmbedType = (values: FormValues): (Embeds.Type & { embed_accounts: string[] }) => {
  return {
    id: '',
    created_at: new Date().toISOString(),
    updated_at: null,
    deleted_on: null,
    organization_id: null,
    user_id: null,
    ...values,
    title: values.title ?? '',
    icon: values.icon ?? null,
    embed_accounts: values.embed_accounts ?? [],
  } as Embeds.Type & { embed_accounts: string[] };
};

export function EmbedSection({ 
  embeds, 
  agencyId, 
  userId, 
  defaultCreationValue,
  showEmbedSelector = false,
  queryKey = ['embeds'],
  externalTabControl = false,
  activeEmbedId: externalActiveEmbedId
}: EmbedSectionProps) {
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

  // Use internal state for tab control only when not using external tab control
  const [internalActiveEmbedId, setInternalActiveEmbedId] = useState<string>(
    defaultEmbed?.id ?? 'new',
  );
  
  // Use the appropriate active embed ID based on control mode
  const activeEmbedId = externalTabControl 
    ? externalActiveEmbedId ?? 'new'
    : internalActiveEmbedId;
  
  // Store default creation values from URL parameters
  const [urlDefaultValues, setUrlDefaultValues] = useState<FormValues | null>(null);

  // Setup mutations with callbacks
  const {
    createMutation,
    handleEmbedCreation,
    handleEmbedUpdate,
    handleEmbedDelete,
  } = useEmbedApiActions({
    agencyId,
    userId,
    activeEmbedId,
    onCreateSuccess: (newEmbed) => {
      if (!externalTabControl) {
        setInternalActiveEmbedId(newEmbed.id);
      }
    },
    onDeleteSuccess: () => {
      if (!externalTabControl) {
        setInternalActiveEmbedId('new');
      }
    },
    queryKey,
  });

  // Handle URL parameters
  useEmbedUrlParams({
    formattedEmbeds,
    setActiveEmbedId: externalTabControl ? (() => {/* no-op */}) : setInternalActiveEmbedId,
    updateEmbed: (id, values, isAccountRemoval) => {
      // First set active tab to show what's being modified
      if (!externalTabControl) {
        setInternalActiveEmbedId(id);
      }
      // Then update the embed
      void handleEmbedUpdate(values, { isAccountRemoval });
    },
    deleteEmbed: handleEmbedDelete,
    setDefaultCreationValues: (values) => {
      // Just set the default values, don't trigger creation
      setUrlDefaultValues(values);
    },
  });

  const handleTabChange = (tabId: string) => {
    if (!externalTabControl) {
      setInternalActiveEmbedId(tabId);
    }
  };

  // Determine which default values to use - prioritize URL values over props
  const effectiveDefaultValue = urlDefaultValues ?? defaultCreationValue ?? null;
  
  // Convert FormValues to Embeds.Type if needed
  const processedDefaultValue = effectiveDefaultValue && 'id' in effectiveDefaultValue 
    ? effectiveDefaultValue 
    : effectiveDefaultValue 
      ? formValuesToEmbedType(effectiveDefaultValue)
      : null;

  // Render content for the currently active embed
  const renderActiveEmbedContent = () => {
    // The "new" tab to create a new integration
    if (activeEmbedId === 'new') {
      return (
        <div className="flex h-full gap-8">
          <div className="flex-1 p-8 bg-gray-200 overflow-y-auto rounded-lg">
            <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
          </div>
          <EmbedEditor 
            onAction={handleEmbedCreation} 
            type="create"
            defaultValue={processedDefaultValue} 
            availableEmbeds={formattedEmbeds}
            showEmbedSelector={showEmbedSelector}
          />
        </div>
      );
    }

    // Existing embed tab
    const activeEmbed = formattedEmbeds.find(embed => embed.id === activeEmbedId);
    if (!activeEmbed) return null;

    return (
      <div className="flex h-full gap-8">
        <div className="flex-1 p-8 bg-gray-200 overflow-y-auto rounded-lg">
          <EmbedPreview embedSrc={activeEmbed.value} />
        </div>
        <EmbedEditor
          type="update"
          onAction={handleEmbedUpdate}
          defaultValue={activeEmbed}
          availableEmbeds={formattedEmbeds.filter(e => e.id !== activeEmbed.id)}
          showEmbedSelector={false}
        />
      </div>
    );
  };

  // When using external tab control, just render the content for the active tab
  if (externalTabControl) {
    return (
      <div className="h-full min-h-0 flex-1 overflow-hidden">
        {renderActiveEmbedContent()}
      </div>
    );
  }

  // No embeds to display - still show the "Add Integration" tab
  if (embeds.length === 0) {
    return (
      <Tabs
        value={activeEmbedId}
        onValueChange={handleTabChange}
        className="h-full w-full text-gray-500 min-h-0 flex flex-col"
      >
        <EmbedTabs
          embeds={[]}
          activeEmbedId={activeEmbedId}
          onDeleteEmbed={handleEmbedDelete}
        />
        <div className="flex-1 min-h-0 overflow-hidden mt-2">
          <div className="flex h-full gap-8">
            <div className="flex-1 p-8 bg-gray-200 overflow-y-auto rounded-lg">
              <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
            </div>
            <EmbedEditor 
              onAction={handleEmbedCreation} 
              type="create"
              defaultValue={processedDefaultValue} 
              availableEmbeds={formattedEmbeds}
              showEmbedSelector={showEmbedSelector}
            />
          </div>
        </div>
      </Tabs>
    );
  }

  // Original internal tabs version
  return (
    <Tabs
      value={activeEmbedId}
      onValueChange={handleTabChange}
      className="h-full w-full text-gray-500 min-h-0 flex flex-col"
    >
      <EmbedTabs
        embeds={formattedEmbeds}
        activeEmbedId={activeEmbedId}
        onDeleteEmbed={handleEmbedDelete}
      />
      <div className="flex-1 min-h-0 overflow-hidden mt-2">
        {/* New Integration Tab Content */}
        <TabsContent value="new" className="h-full min-h-0 flex-1 overflow-hidden mt-0">
          <div className="flex h-full gap-8">
            <div className="flex-1 p-8 bg-gray-200 overflow-y-auto rounded-lg">
              <EmbedPreview embedSrc={createMutation.data?.value ?? ''} />
            </div>
            <EmbedEditor 
              type="create"
              onAction={handleEmbedCreation} 
              defaultValue={processedDefaultValue} 
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
            className="h-full min-h-0 flex-1 overflow-hidden"
          >
            <div className="flex h-full gap-8">
              <div className="flex-1 p-8 bg-gray-200 overflow-y-auto rounded-lg">
                <EmbedPreview embedSrc={embed.value} />
              </div>
              {activeEmbedId === embed.id && (
                <EmbedEditor
                  type="update"
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
