import { useState } from 'react';

import { ArrowLeftRight } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

const mockOrganizations = [
  { label: 'Organization A', value: 'org-a' },
  { label: 'Organization B', value: 'org-b' },
  { label: 'Organization C', value: 'org-c' },
];

function SwitchOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const {t} = useTranslation('clients')

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogTrigger
        className="flex items-center gap-2 w-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
      >
        <ArrowLeftRight className="h-4 w-4" />
        {t('editUser.switchOrganization')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <p className='text-base font-semibold'>
              {t('editUser.switchOrganization')}
            </p>
          </DialogTitle>
        </DialogHeader>
        <Select
          value={selectedOrganization}
          onValueChange={(value) => setSelectedOrganization(value)}
        >
          <SelectTrigger>
            <SelectValue>
              {selectedOrganization
                ? mockOrganizations.find(
                    (org) => org.value === selectedOrganization,
                  )?.label
                : 'Select organization'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mockOrganizations.map((org) => (
              <SelectItem key={org.value} value={org.value}>
                {org.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ThemedButton className='w-full'>
          {t('editUser.switchOrganization')}
        </ThemedButton>
      </DialogContent>
    </Dialog>
  );
}

export default SwitchOrganizationDialog;
