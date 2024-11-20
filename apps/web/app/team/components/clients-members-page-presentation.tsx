'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import {
  AccountInvitationsTable,
  AccountMembersTable,
  InviteMembersDialogContainer,
} from '@kit/team-accounts/components';
import { If } from '@kit/ui/if';
// import { InfoIcon } from "lucide-react";
import { PageBody } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { PageTitle } from '../../components/page-title';
// import { useBilling } from '../../home/[account]/hooks/use-billing';

const ClientsMembersPagePresentation = ({
  account,
  currentUserRoleHierarchy,
  slug,
  members,
  invitations,
  canAddMember,
  user,
  canManageRoles,
  canManageInvitations,
  isPrimaryOwner,
}: {
    account: {
      id: string;
      role_hierarchy_level: number;
    };
    currentUserRoleHierarchy: number | undefined;
    slug: string;
    members: {
        id: string;
        user_id: string;
        account_id: string;
        role: string;
        role_hierarchy_level: number;
        primary_owner_user_id: string;
        name: string;
        email: string;
        picture_url: string;
        created_at: string;
        updated_at: string;
    }[];
    invitations: {
        id: number;
        email: string;
        account_id: string;
        invited_by: string;
        role: string;
        created_at: string;
        updated_at: string;
        expires_at: string;
        inviter_name: string;
        inviter_email: string;
    }[];
    canAddMember: boolean;
    user: {
      id: string;
    };
    canManageRoles: boolean;
    canManageInvitations: boolean;
    isPrimaryOwner: boolean;
}) => {
  // const [showDropdown, setShowDropdown] = useState(false);
  // const [addMemberIsAvailable, setAddMemberIsAvailable] = useState(false);
  // const { subscriptionFetchedStripe } = useBilling();
  // const { t } = useTranslation('team');
  // const router = useRouter();
// const seatByPlans = {
//   0: 1,
//   25: 5,
//   45: 10,
// };
    // useEffect(() => {
        // if (subscriptionFetchedStripe) {
        //   if (members.length >= seatByPlans[subscriptionFetchedStripe?.plan?.amount as keyof typeof seatByPlans]) {
        //       setAddMemberIsAvailable(true);
        //   } else {
        //       setAddMemberIsAvailable(false);
        //   }
        // }
    // }, [members, subscriptionFetchedStripe]);

  return (
    <PageBody>
      <div className="p-[35px]">
        <PageTitle i18nKey="team:team" />

        <div className="w-full">
          <div className="flex items-center justify-between pb-[28px]">
            <If condition={canManageInvitations && canAddMember}>
              <div className="flex items-center gap-2">
                <h3 className="font-bold">
                  <Trans i18nKey={'common:membersTabLabel'} />
                </h3>
                {members && (
                  <div className="rounded-full border border-brand-700 bg-brand-50 px-2 py-0 text-brand-700">
                    <span className="inline-flex gap-2 text-[12px]">
                      <span>{members.length}</span>
                      {members.length === 1 ? (
                        <Trans i18nKey={'team:labelNumberOfUsers.singular'} />
                      ) : (
                        <Trans i18nKey={'team:labelNumberOfUsers.plural'} />
                      )}
                    </span>
                  </div>
                )}
              </div>
              {/* {account?.role_hierarchy_level === 2 && subscriptionFetchedStripe && ( */}
                  <div
                    // className="invite-button-container"
                    // onMouseEnter={() => setShowDropdown(true)}
                    // onMouseLeave={() => setShowDropdown(false)}
                  >
                    <ThemedButton
                      data-test={'invite-members-form-trigger'}
                      // disabled={addMemberIsAvailable}
                      className="p-0"
                    >
                        <InviteMembersDialogContainer
                  userRoleHierarchy={currentUserRoleHierarchy ?? 0}
                  accountSlug={slug}
                >
                    <span className="p-2">
                        <Trans i18nKey={'team:inviteMembersButton'} />
                      </span>
                </InviteMembersDialogContainer>
                      
                    </ThemedButton>
                    {/* {showDropdown && members.length >= seatByPlans[subscriptionFetchedStripe?.plan?.amount as keyof typeof seatByPlans] && (
                      <div className="dropdown absolute top-4 right-24 px-9 py-14 rounded-md w-fit transform transition-transform duration-300 ease-in-out animate-fade-in">
                        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground gap-3 items-center">
                        <div className='flex mb-2'>
                        <InfoIcon size="14" strokeWidth={2} />
                        <div className='pl-2'>
                          {t('plan.message')}
                        </div>
                        </div>
                        <ThemedButton
                          size={'sm'}
                          onClick={() => {
                            router.push('/home/settings?tab=billing')
                        }}
                        > 
                          {t('plan.upgradeButton')}
                        </ThemedButton>
                        </div>

                      </div>
                    )} */}
                  </div>
              {/* )} */}
            </If>
          </div>
        </div>

        <Separator />
        <div className="mt-4">
          <AccountMembersTable
            userRoleHierarchy={currentUserRoleHierarchy ?? 0}
            currentUserId={user.id}
            currentAccountId={account.id ?? ''}
            members={members}
            isPrimaryOwner={isPrimaryOwner}
            canManageRoles={canManageRoles}
          />
        </div>

        <div className="mt-12">
          <AccountInvitationsTable
            permissions={{
              canUpdateInvitation: canManageRoles,
              canRemoveInvitation: canManageRoles,
              currentUserRoleHierarchy: currentUserRoleHierarchy ?? 0,
            }}
            invitations={invitations}
          />
        </div>
      </div>
    </PageBody>
  );
};

export default ClientsMembersPagePresentation;