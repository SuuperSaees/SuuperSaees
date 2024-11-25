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
import { useState } from 'react';

interface AgencyClientCrudMenuProps {
  userId: string;
  name: string;
  email: string;
  queryKey?: string;
}

function AgencyClientCrudMenu({userId, name, email, queryKey}: AgencyClientCrudMenuProps) {
  const {t} = useTranslation('clients');
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 text-gray-600' align="end" sideOffset={5}>
          <DropdownMenuItem onSelect={() => {
            setOpenEditUserDialog(true);
          }}>
            <div className="flex items-center gap-2 w-full h-full cursor-pointer">
              <Pen className="h-4 w-4" />
              {t('editUser.edit')}
            </div>
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
            <DeleteUserDialog userId={userId} showLabel = {true} queryKey={queryKey ?? undefined} />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <EditUserDialog userId={userId} name={name} email={email} isOpen={openEditUserDialog} setIsOpen={setOpenEditUserDialog} />
    </>
  );
}

export default AgencyClientCrudMenu;