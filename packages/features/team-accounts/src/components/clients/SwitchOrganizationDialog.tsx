import { useState } from 'react';
import { ChevronDown} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@kit/ui/command';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Button } from '@kit/ui/button';
import { switchUserOrganization} from '../../server/actions/members/update/update-account';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface SwitchOrganizationDialogProps {
  userId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  organizationOptions : {id:string, name:string, slug:string}[];
}

function SwitchOrganizationDialog({userId, setIsOpen, isOpen, organizationOptions}: SwitchOrganizationDialogProps) {
  const [isOpenPopup, setIsOpenPopup] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const {t} = useTranslation('clients')
  const router = useRouter()

  const changeOrganizationMutation = useMutation({
    mutationFn: async () => {
      await switchUserOrganization(selectedOrganization, userId);
      router.refresh()
    },
    onSuccess: () => {
      toast.success(t('success'), {
        description: t('editUser.successEdit'),
      });
    },
    onError: (error) => {
      console.error('Error changing organization:', error);
      toast.error('Error', {
        description: error.message,
      });
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <p className='text-base font-semibold'>
              {t('editUser.switchOrganization')}
            </p>
          </DialogTitle>
        </DialogHeader>
        <Popover open={isOpenPopup} onOpenChange={setIsOpenPopup}>
          <PopoverTrigger asChild className='w-full'>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={isOpenPopup}
              className="w-full justify-between"
            >
              {selectedOrganization
                ? organizationOptions?.find((org) => org.id === selectedOrganization)?.name
                : t('editUser.selectOrganization')}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full h-52 p-0">
            <Command>
              <CommandInput placeholder={t('editUser.selectOrganization')} />
              <CommandList>
                <CommandEmpty>{t('editUser.noOrganizations')}</CommandEmpty>
                <CommandGroup>
                  {organizationOptions?.map((org) => (
                    <CommandItem
                      key={org.slug}
                      value={org.name ?? ''}
                      onSelect={() => {
                        setSelectedOrganization(org.id)
                        setIsOpenPopup(false)
                      }}
                    >
                      {org.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <ThemedButton className='w-full' disabled = {selectedOrganization == ''} onClick= {() => {
          changeOrganizationMutation.mutate();
          setIsOpen(false);
        }}>
          {t('editUser.switchOrganization')}
        </ThemedButton>
      </DialogContent>
    </Dialog>
  );
}

export default SwitchOrganizationDialog;
