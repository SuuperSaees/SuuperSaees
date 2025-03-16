import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { Embeds } from '~/lib/embeds.types';
import { FormValues } from '../schema';

interface UseEmbedUrlParamsProps {
  formattedEmbeds: (Embeds.Type & { embed_accounts: string[] })[];
  setActiveEmbedId: (id: string) => void;
  updateEmbed: (id: string, values: FormValues, isAccountRemoval?: boolean) => void;
  deleteEmbed: (id: string) => void;
  setDefaultCreationValues?: (values: FormValues) => void;
}

export function useEmbedUrlParams({
  formattedEmbeds,
  setActiveEmbedId,
  updateEmbed,
  deleteEmbed,
  setDefaultCreationValues,
}: UseEmbedUrlParamsProps) {
  const searchParams = useSearchParams();
  const processedQueryRef = useRef<{id: string | null, action: string | null}>({ id: null, action: null });

  useEffect(() => {
    const id = searchParams.get("id");
    const action = searchParams.get("action");
    const accountId = searchParams.get("accountId");

    // Skip if we've already processed these exact parameters
    if (processedQueryRef.current.id === id && 
        processedQueryRef.current.action === action) {
      return;
    }

    // Update the ref with current parameters
    processedQueryRef.current = { id, action };

    // Clear query parameters
    const clearQueryParams = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("id");
      url.searchParams.delete("action");
      url.searchParams.delete("accountId");
      window.history.replaceState({}, "", url);
    };

    // Handle create action (without id)
    if (action === "create") {
      // Clear query parameters
      clearQueryParams();
      
      // Set active tab to 'new'
      setActiveEmbedId('new');
      
      // If accountId is provided, prepare default values with the account
      if (accountId && setDefaultCreationValues) {
        // Create default values with the specified account
        const defaultValues: FormValues = {
          title: '',
          location: 'sidebar',
          value: '',
          type: 'iframe',
          visibility: 'private',
          embed_accounts: [accountId],
        };
        
        // Set default values for the creation form
        setDefaultCreationValues(defaultValues);
      }
      
      return;
    }

    // Handle actions that require an id
    if (id && action) {
      // Clear query parameters
      clearQueryParams();

      // Check if the embed with the given ID exists
      const embed = formattedEmbeds.find((embed) => embed.id === id);

      if (!embed) {
        toast.error("Integration not found");
        return;
      }

      if (action === "edit") {
        // Set the active tab to the specified embed ID
        setActiveEmbedId(id);
      } else if (action === "delete") {
        // Set the active tab to show the user what's being modified/deleted
        setActiveEmbedId(id);
        
        if (accountId) {
          // Case 1: Remove an account from the embed
          // Remove the account from embed_accounts and update
          const updatedEmbedAccounts = embed.embed_accounts.filter(
            accId => accId !== accountId
          );
          
          // Create updated embed data with only the required properties and default values
          const updatedValues: FormValues = {
            title: embed.title ?? '',
            location: embed.location === 'tab' ? 'tab' : 'sidebar',
            value: embed.value,
            type: embed.type === 'iframe' ? 'iframe' : 'url',
            // Ensure visibility is never null
            visibility: embed.visibility ?? 'private',
            icon: embed.icon,
            embed_accounts: updatedEmbedAccounts
          };
          
          // Update the embed with the account removal flag
          updateEmbed(id, updatedValues, true);
        } else {
          // Case 2: Delete the entire embed
          deleteEmbed(id);
        }
      }
    }
  }, [searchParams, formattedEmbeds, setActiveEmbedId, updateEmbed, deleteEmbed, setDefaultCreationValues]);
} 