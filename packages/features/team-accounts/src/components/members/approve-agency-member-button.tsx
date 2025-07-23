'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@kit/ui/button';
import { toast } from 'sonner';

import { approveAgencyMember } from '../../server/actions/agency-members/approve-agency-member';

interface ApproveAgencyMemberButtonProps {
  userId: string;
  memberName: string;
  memberEmail: string;
  domain: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export function ApproveAgencyMemberButton({
  userId,
  memberName,
  memberEmail,
  domain,
  disabled = false,
  onSuccess,
}: ApproveAgencyMemberButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('team');
  const router = useRouter();

  const handleApprove = async () => {
    if (isLoading || disabled) return;

    setIsLoading(true);

    try {
      await approveAgencyMember(userId, domain, '/team');

      toast.success(t('memberApproved'), {
        description: t('memberApprovedDescription', {
          name: memberName || memberEmail,
        }),
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error approving member:', error);
      
      toast.error(t('approvalFailed'), {
        description: error instanceof Error ? error.message : t('approvalFailedDescription'),
      });

    } finally {
      setIsLoading(false);
      router.refresh(); // Refresh the page to reflect changes
      router.push('/team'); // Redirect to team page after approval
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleApprove}
      disabled={disabled || isLoading}
      className="flex items-center space-x-1"
    >
      <CheckIcon className="h-4 w-4" />
      <span>{isLoading ? t('approving') : t('approve')}</span>
    </Button>
  );
}
