import { MoreVertical, LockKeyhole, Users, Pen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import DeleteUserDialog from '../../server/actions/clients/delete/delete-client';
import EditUserDialog from './edit-user-dialog';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {AdminImpersonateUserDialog} from '../../../../../features/admin/src/components/admin-impersonate-user-dialog';
import ResetPasswordDialog from './reset-password-dialog';
import { useQuery } from '@tanstack/react-query';
import { getUserRoleById } from '../../server/actions/members/get/get-member-account';

interface AgencyClientCrudMenuProps {
  userId: string;
  name: string;
  email: string;
  queryKey?: string;
  organizationOptions? : {id:string, name:string, slug:string}[];
  currentUserRole?: string
  currentUserId?: string
  inTeamMembers?: boolean
  targetRole?: string
}

function AgencyClientCrudMenu({userId, name, email, queryKey, currentUserRole, currentUserId, inTeamMembers=false, targetRole}: AgencyClientCrudMenuProps) {
  const {t} = useTranslation('clients');
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openImpersonateUserDialog, setOpenImpersonateUserDialog] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false)

  let {
    data: userRole,
    isLoading,
    isPending,
  } = useQuery({
    queryKey: ['userRole', userId],
    queryFn: async () => await getUserRoleById(userId, true),
    enabled: !targetRole,
  });


  userRole = targetRole ?? userRole;
  isLoading = targetRole ? false : isLoading;
  isPending = targetRole ? false : isPending;
  //If my role is not agency_owner and the user's role is agency_owner, I cannot impersonate him
  const cannotImpersonate = currentUserRole !== 'agency_owner' && userRole === 'agency_owner'

  //Condition to check if the user would try to impersonate himself
  const selfImpersonate = userId === currentUserId

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreVertical className='w-4 h-4 text-gray-400'/>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56 text-gray-600' align="end" sideOffset={5}>
          <DropdownMenuItem onSelect={() => {
            setOpenEditUserDialog(true);
          }}>
            <div className="flex items-center gap-2 w-full h-full cursor-pointer">
              <Pen className="h-4 w-4 text-gray-400" />
              {t('editUser.edit')}
            </div>
          </DropdownMenuItem>
          {!isLoading && !isPending && !cannotImpersonate && !selfImpersonate && (
            <DropdownMenuItem
              onSelect={() => {
                setOpenImpersonateUserDialog(true);
              }}
            >
              <div className="flex gap-2 items-center w-full h-full cursor-pointer">
                <Users className="w-4 h-4 text-gray-400" />
                {t('editUser.supplant')}
              </div>
            </DropdownMenuItem>
          )}
          
          {/* <DropdownMenuItem onSelect={() => setOpenSwitchOrganizationDialog(true)}>
            <div className='flex gap-2 items-center w-full h-full cursor-pointer'>
              <ArrowLeftRight className="h-4 w-4" />
              {t('editUser.switchOrganization')}
            </div>
          </DropdownMenuItem> */}
          <DropdownMenuItem className='flex gap-2 items-center w-full h-full cursor-pointer' onSelect={() => setOpenResetPasswordDialog(true)}>
            <LockKeyhole className='w-4 h-4 text-gray-400' /> 
            {t('editUser.resetPassword')}
          </DropdownMenuItem>
          {
            //Prevent someone else from deleting the agency_owner and prevent users from deleting themselves by mistake
            !isLoading && !isPending && !cannotImpersonate && !selfImpersonate && (
            <DropdownMenuItem className='cursor-pointer' onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}>
              <DeleteUserDialog userId={userId} showLabel = {true} queryKey={queryKey ?? undefined}  inTeamMembers={inTeamMembers}/>
            </DropdownMenuItem>
          )}
          
        </DropdownMenuContent>
      </DropdownMenu>
      
      <EditUserDialog userId={userId} name={name} email={email} isOpen={openEditUserDialog} setIsOpen={setOpenEditUserDialog} currentUserRole={currentUserRole} userRole={userRole} isLoading={isLoading} isPending={isPending} />
      <AdminImpersonateUserDialog userId={userId} isOpen = {openImpersonateUserDialog} setIsOpen={setOpenImpersonateUserDialog}>
        <></>
      </AdminImpersonateUserDialog>
      {/* <SwitchOrganizationDialog userId={userId} isOpen={openSwitchOrganizationDialog} setIsOpen={setOpenSwitchOrganizationDialog} organizationOptions = {organizationOptions} /> */}
      <ResetPasswordDialog userId={userId} isOpen={openResetPasswordDialog} setIsOpen={setOpenResetPasswordDialog} />
    </>
  );
}

export default AgencyClientCrudMenu;