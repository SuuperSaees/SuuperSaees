import { EllipsisVertical, LockKeyhole, ArrowLeftRight, Users, Pen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import DeleteUserDialog from '../../server/actions/clients/delete/delete-client';
import EditUserDialog from './edit-user-dialog';
import SwitchOrganizationDialog from './SwitchOrganizationDialog';
import { useTranslation } from 'react-i18next';

interface AgencyClientCrudMenuProps {
  userId: string;
}

function AgencyClientCrudMenu({userId}: AgencyClientCrudMenuProps) {
  const {t} = useTranslation('clients');
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <EllipsisVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56 text-gray-600' align="end" sideOffset={5}>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <EditUserDialog />
        </DropdownMenuItem>
        <DropdownMenuItem className='flex gap-2 items-center'>
          <Users className='w-4 h-4' />
          {t('editUser.supplant')}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <SwitchOrganizationDialog />
        </DropdownMenuItem>
        <DropdownMenuItem className='flex gap-2 items-center'>
          <LockKeyhole className='w-4 h-4' /> 
          {t('editUser.resetPassword')}
        </DropdownMenuItem>
        <DropdownMenuItem className='cursor-pointer' onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
          <DeleteUserDialog userId={userId} showLabel = {true} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default AgencyClientCrudMenu;