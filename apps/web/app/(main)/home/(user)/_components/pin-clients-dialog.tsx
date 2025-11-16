'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search, Check, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';

import { getClientsOrganizations } from '~/team-accounts/src/server/actions/clients/get/get-clients';
import Avatar from '../../../../components/ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';
import { Spinner } from '@kit/ui/spinner';
import { useTranslation } from 'react-i18next';

// Define the client type from the API response
type ClientOrganization = {
  id: string;
  name: string;
  picture_url?: string;
};

interface PinClientsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PinClientsDialog({ open, onOpenChange }: PinClientsDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [originalSelectedIds, setOriginalSelectedIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { pinned_organizations, updateOrganizationSetting } = useOrganizationSettings();
  const { t } = useTranslation('common');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add wheel event handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const isMouseOver = 
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isMouseOver) {
        e.preventDefault();
        container.scrollBy({
          left: e.deltaY * 1.5,
          behavior: 'smooth'
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Fetch clients - only when the dialog is open
  const { data: clients = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['clientOrganizations'],
    queryFn: async () => await getClientsOrganizations(),
    refetchOnWindowFocus: false,
    enabled: open,
  }) as { 
    data: ClientOrganization[], 
    isLoading: boolean, 
    isError: boolean,
    refetch: () => Promise<unknown>
  };

  // Initialize selected clients from pinned_organizations when dialog opens
  useEffect(() => {
    if (open && pinned_organizations) {
      try {
        const pinnedIds = JSON.parse(pinned_organizations) as string[];
        setSelectedClientIds(pinnedIds);
        setOriginalSelectedIds(pinnedIds);
      } catch (e) {
        setSelectedClientIds([]);
        setOriginalSelectedIds([]);
      }
    }
  }, [open, pinned_organizations]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setSaveError(null);
      setIsSaving(false);
    }
  }, [open]);

  // Filter clients based on search query and exclude guests
  const filteredClients = clients.filter(client => 
    !client.name.toLowerCase().startsWith('guest') &&
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected clients data
  const selectedClients = clients.filter(client => 
    selectedClientIds.includes(client.id)
  );

  // Handle toggling a client selection
  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  // Handle removing a client from selection
  const removeClient = (clientId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedClientIds(prev => prev.filter(id => id !== clientId));
  };

  // Handle saving pinned clients
  const savePinnedClients = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      await updateOrganizationSetting.mutateAsync({
        key: 'pinned_organizations',
        value: JSON.stringify(selectedClientIds),
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save pinned clients:', error);
      setSaveError('Failed to save changes. Please try again.');
      setSelectedClientIds(originalSelectedIds);
    } finally {
      setIsSaving(false);
    }
  };

  // Reset state when dialog closes
  const handleDialogChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery('');
      setSaveError(null);
      setIsSaving(false);
    }
    onOpenChange(isOpen);
  };

  // Check if there are unsaved changes
  const hasUnsavedChanges = () => {
    if (selectedClientIds.length !== originalSelectedIds.length) return true;
    return selectedClientIds.some(id => !originalSelectedIds.includes(id));
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-md border border-gray-200 shadow-md">
        <div className="p-5 border-b border-gray-100">
          <DialogHeader className="mb-0 space-y-1">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-gray-500" />
              <DialogTitle className="text-lg font-medium">{t('sidebar.pinClients')}</DialogTitle>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {t('sidebar.pinClientsDescription')}
            </p>
          </DialogHeader>
        </div>
        
        {/* Selected clients pills - horizontal scrolling */}
        {selectedClients.length > 0 && (
          <div className="px-5 pt-3 pb-2 border-b border-gray-100 min-w-0">
            <div 
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 no-scrollbar"
            >
              {selectedClients.map(client => (
                <div 
                  key={client.id}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs whitespace-nowrap"
                >
                  <Avatar
                    src={client.picture_url ?? ''}
                    alt={client.name}
                    username={client.name}
                    className="h-4 w-4 mr-1"
                  />
                  <span className="font-medium text-gray-700">{client.name}</span>
                  <button 
                    onClick={(e) => removeClient(client.id, e)}
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={`Remove ${client.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Search input */}
        <div className="px-5 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder={t('sidebar.searchClients')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-full border-gray-200 rounded-md text-sm focus:ring-gray-300 focus:border-gray-300"
            />
          </div>
        </div>
        
        {/* Clients list with improved loading state and error handling */}
        <div className="px-5 py-3 max-h-[240px] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Spinner className='text-gray-500 h-6 w-6' />
              <p className="text-sm font-medium">{t('sidebar.loadingClients')}</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mb-3">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
                <p className="text-gray-700 text-sm font-medium mb-1">{t('sidebar.failedToLoadClients')}</p>
                <p className="text-gray-500 text-xs mb-4">{t('sidebar.errorLoadingClients')}</p>
              <Button 
                onClick={() => refetch()} 
                variant="outline" 
                size="sm"
                className="text-xs px-3 py-1 h-7"
              >
                {t('sidebar.tryAgain')}
              </Button>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <div className="flex justify-center mb-2">
                <Search className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 text-sm font-medium">{t('sidebar.noClientsFound')}</p>
              <p className="text-gray-400 text-xs mt-1">{t('sidebar.differentSearchTerm')}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredClients.map(client => {
                const isSelected = selectedClientIds.includes(client.id);
                return (
                  <div 
                    key={client.id}
                    className={cn(
                      "flex items-center p-2 rounded-md cursor-pointer transition-all",
                      isSelected 
                        ? "bg-gray-50" 
                        : "hover:bg-gray-50"
                    )}
                    onClick={() => toggleClientSelection(client.id)}
                  >
                    <div className={cn(
                      "flex items-center justify-center h-4 w-4 rounded-sm mr-2 transition-all",
                      isSelected 
                        ? "bg-blue-600 text-white border-0" 
                        : "border border-gray-300"
                    )}>
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex items-center flex-1">
                      <Avatar
                        src={client.picture_url ?? ''}
                        alt={client.name}
                        username={client.name}
                        className="h-6 w-6 mr-2"
                      />
                      <span className={cn(
                        "text-sm",
                        isSelected ? "text-gray-900 font-medium" : "text-gray-700"
                      )}>
                        {client.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {saveError && (
          <div className="px-5 py-2 bg-red-50 border-t border-red-100">
            <div className="flex items-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{saveError}</p>
            </div>
          </div>
        )}
        
        <DialogFooter className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {hasUnsavedChanges() && !isSaving && (
              <span className="flex items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mr-1.5"></span>
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button 
                variant="outline" 
                className="h-8 px-3 text-xs border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                disabled={isSaving}
              >
                {t('sidebar.cancel')}
              </Button>
            </DialogClose>
            <Button 
              onClick={savePinnedClients} 
              disabled={isSaving || isLoading || isError || !hasUnsavedChanges()}
              className={cn(
                "h-8 px-3 text-xs min-w-[60px] relative",
                hasUnsavedChanges() ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
              )}
            >
              {isSaving ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  <span>{t('sidebar.saving')}</span>
                </div>
              ) : (
                t('sidebar.save')
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 