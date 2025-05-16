import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { ThemedButton } from '../../../../accounts/src/components/ui/button-themed-with-settings';
import { Input } from '@kit/ui/input';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { updateUserPassword } from '../../server/actions/members/update/update-account';
import { z } from 'zod';

interface ResetPasswordDialogProps {
  userId: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}


function ResetPasswordDialog({ userId, setIsOpen, isOpen }: ResetPasswordDialogProps) {
  const { t } = useTranslation('clients');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  const passwordSchema = z.object({
    newPassword: z.string().min(8, { message: t('editUser.passwordMinimalLength') }),
    confirmPassword: z.string().min(8, { message: t('editUser.passwordMinimalLength') }),
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: t('editUser.passwordsNotEqual'),
    path: ['confirmPassword'],
  });
  
  const domain = (typeof window !== 'undefined' 
    ? window.location.host
    : '');

  const mutateUser = useMutation({
    mutationFn: async () => {
      await updateUserPassword(userId, newPassword, undefined, true, domain);
    },
    onSuccess: () => {
      toast.success(t('success'), {
        description: t('editUser.successEdit'),
      });
    },
    onError: (error) => {
      toast.error('Error', {
        description: t('editUser.failureEdit'),
      });
    },
  });

  const handleResetPassword = () => {
    const result = passwordSchema.safeParse({ newPassword, confirmPassword });
    if (!result.success) {
      const fieldErrors = result.error.format();
      setErrors({
        newPassword: fieldErrors.newPassword?._errors[0],
        confirmPassword: fieldErrors.confirmPassword?._errors[0],
      });
      return;
    }

    setErrors({});
    mutateUser.mutate();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <p className="text-base font-semibold">
              {t('editUser.resetPassword')}
            </p>
          </DialogTitle>
        </DialogHeader>
        <div className="mb-1">
          <p className="mb-1 text-sm">
            {t('editUser.enterNewPassword')}
          </p>
          <Input
            className="w-full"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.newPassword}
            </p>
          )}
        </div>

        <div>
          <p className="mb-1 text-sm">
            {t('editUser.confirmNewPassword')}
          </p>
          <Input
            className="w-full"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <ThemedButton className="w-full" onClick={handleResetPassword}>
          {t('editUser.resetPassword')}
        </ThemedButton>
      </DialogContent>
    </Dialog>
  );
}

export default ResetPasswordDialog;