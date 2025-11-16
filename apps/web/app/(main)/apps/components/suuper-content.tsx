'use client';

import React, { useEffect, useState } from 'react';

import { Copy, Trash2 } from 'lucide-react';
// import { CopyDomain } from 'node_modules/@kit/accounts/src/components/personal-account-settings/copy-domain';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@kit/ui/dialog';
import { Spinner } from '@kit/ui/spinner';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';

import Tooltip from '~/components/ui/tooltip';

import { getAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import { updateAccountPlugin } from '~/server/actions/account-plugins/account-plugins.action';
import EmptyStateSuuperApi from './empty-state-suuper-api';
import CreateApiKeyDialog from './create-api-key-dialog';
import { createToken } from '~/server/actions/tokens/tokens.action';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

function SuuperApiContentStatic({
  pluginId,
  userId,
}: {
  pluginId: string;
  userId?: string;
}) {
  const { organization } = useUserWorkspace();
  const [credentials, setCredentials] = useState<{api_keys: {
    api_key: string;
    user_id: string;
    name: string;
    role: string;
    created_at: string;
    updated_at: string;
    organization_id: string;
  }[]}>({
    api_keys: [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { t } = useTranslation('plugins');

  useEffect(() => {
    if (!pluginId) return;

    const fetchPluginData = async () => {
      try {
        setIsLoading(true);
        const response = await getAccountPlugin(pluginId);

        if (response) {
          const fetchedCredentials = response.credentials as Record<string, unknown>;

          setCredentials({
            api_keys: (fetchedCredentials?.api_keys as {
              api_key: string;
              user_id: string;
              name: string;
              role: string;
              created_at: string;
              updated_at: string;
              organization_id: string;
            }[]
            ) || [],
          });
        } else {
          throw new Error(t('errorFetchingSuuperApiCredentials'));
        }
      } catch (error) {
        console.error(t('errorFetchingSuuperApiCredentials'), error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchPluginData();
  }, [pluginId, t]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('successMessage'), {
        description: t('clipboardCopied'),
      });
    } catch (error) {
      console.error(t('clipboardCopyError'), error);
      toast.error(t('errorMessage'), {
        description: t('clipboardCopyError'),
      });
    }
  };

  const handleCreateApiKey = async (data: {
    name: string;
    organization_id: string;
    user_id: string;
    role: string;
  }) => {
    try {
      // Generate a random API key
      // 1. Generate access token with the data
      const domain = typeof window !== 'undefined' ? window.location.host : '';

      const accessToken = await createToken({
        ...data,
        domain: domain,
        agency_id: organization?.id ?? '',
      });
      // 2. Generate API key with the access token
      const apiKey = `suuper_${accessToken?.accessToken}_${btoa(accessToken?.tokenId ?? '')}`;
      
      const newApiKey = {
        api_key: apiKey,
        user_id: data.user_id,
        name: data.name,
        role: data.role,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        organization_id: data.organization_id,
      };
      
      // Update the plugin credentials with the new API key
      const updatedApiKeys = [...credentials.api_keys, newApiKey];
      
      await updateAccountPlugin(
        pluginId,
        {
          credentials: { api_keys: updatedApiKeys },
          provider: 'suuper',
          account_id: userId ?? '',
          provider_id: crypto.randomUUID(),
        },
      );
      
      setCredentials({ api_keys: updatedApiKeys });
      setOpenDialog(false);
      
      toast.success(t('successMessage'), {
        description: t('apiKeyCreatedSuccess'),
      });
      
      return true;
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error(t('errorMessage'), {
        description: t('failedToCreateApiKey'),
      });
      return false;
    }
  };

  const handleDeleteApiKey = async () => {
    if (!apiKeyToDelete) return;
    
    setIsDeleting(true);
    try {
      // Filter out the API key to delete
      const updatedApiKeys = credentials.api_keys.filter(
        key => key.api_key !== apiKeyToDelete
      );
      
      // Update the plugin credentials
      await updateAccountPlugin(
        pluginId,
        {
          credentials: { api_keys: updatedApiKeys },
          provider: 'suuper',
          account_id: userId ?? '',
          provider_id: crypto.randomUUID(),
        },
      );
      
      setCredentials({ api_keys: updatedApiKeys });
      toast.success(t('successMessage'), {
        description: t('apiKeyDeletedSuccess'),
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error(t('errorMessage'), {
        description: t('failedToDeleteApiKey'),
      });
    } finally {
      setIsDeleting(false);
      setApiKeyToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const openDeleteDialog = (apiKey: string) => {
    setApiKeyToDelete(apiKey);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {isLoading ? (
        <Spinner className="h-5" />
      ) : (
        <>
          {/* API Keys Section */}
          <div className="mb-6 flex flex-col gap-4">
           <div className="flex items-center justify-between w-full">
            <label className="col-span-1 text-sm font-medium text-gray-700">
                {t('suuperApiKeys')}
              </label>
              {/* Add a tooltip to the button */}
              <Tooltip content={t('generateNewApiKeyTooltip')}>
                <ThemedButton
                  variant="outline"
                  size="sm"
                onClick={() => setOpenDialog(true)}
              >
                {t('generateNewApiKey')}
              </ThemedButton>
              </Tooltip>
           </div>
            <div className="relative col-span-2">
              {credentials.api_keys?.map((currentApiKey) => (  
                <div key={currentApiKey.api_key} className="mb-2 p-3 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{currentApiKey.name}</span>
                    <span className="text-xs text-gray-500">
                      {t('created')}: {new Date(currentApiKey.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <ThemedInput
                    className="w-full mb-1"
                    value={currentApiKey.api_key}
                    disabled={true}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{t('organization')}: {currentApiKey.organization_id}</span>
                    <span>{t('user')}: {currentApiKey.user_id}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        className="text-gray-500 hover:text-gray-700 flex items-center"
                        type="button"
                        onClick={() => handleCopyToClipboard(currentApiKey.api_key)}
                      >
                        <Copy className="h-4 w-4 mr-1" /> {t('copy')}
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 flex items-center"
                        type="button"
                        onClick={() => openDeleteDialog(currentApiKey.api_key)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> {t('deleteApiKey')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {
            !credentials.api_keys?.length && (
                <EmptyStateSuuperApi />
            )
          }

          <CreateApiKeyDialog 
            isOpen={openDialog}
            setIsOpen={setOpenDialog}
            onCreateApiKey={handleCreateApiKey}
          />

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('deleteApiKey')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('deleteApiKeyConfirmation')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>{t('cancel')}</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteApiKey}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      {t('deleting')}
                    </>
                  ) : (
                    t('delete')
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}

export default SuuperApiContentStatic;
