'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@kit/ui/spinner';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Form, FormField } from '@kit/ui/form';
import { Label } from '@kit/ui/label';

import { createReview } from '../../../../../../../packages/features/team-accounts/src/server/actions/review/create/create.review';
import { handleResponse } from '~/lib/response/handle-response';
import { logOrderActivities, updateOrder } from '../../../../../../../packages/features/team-accounts/src/server/actions/orders/update/update-order';
import { Order } from '~/lib/order.types';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';

const reviewSchema = z.object({
  rating: z.number().max(5).optional().nullable(),
  content: z
    .string()
    .min(5, {
      message: 'Content must be at least 5 characters long',
    })
    .max(1000, {
      message: 'Content must be at most 1000 characters long',
    }),
});

export function ReviewDialog({
  orderId,
  statusId,
  className,
  hasExistingReview,
}: {
  orderId: number;
  statusId: number | null;
  className?: string;
  hasExistingReview: boolean;
}) {
  const form = useForm<z.infer<typeof reviewSchema>>({
    mode: 'onChange',
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: null, content: '' },
  });
  const { setValue, getValues } = form;
  const { t } = useTranslation();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { user, workspace } = useUserWorkspace();
  const handleMouseEnter = (rating: number) => setHoveredRating(rating);
  const handleMouseLeave = () => setHoveredRating(null);
  const handleClick = (rating: number) => {
    setValue('rating', rating);
  };

  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!statusId) throw new Error('Status ID is required');
      const res = await updateOrder(orderId, { status: 'completed', status_id: statusId });

      const fields: (keyof Order.Update)[] = ['status'];
      await logOrderActivities(
        orderId,
        res.order,
        user?.id ?? '',
        workspace.name ?? user?.user_metadata?.name ?? user?.user_metadata?.email ?? '',
        undefined,
        fields
      );
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
      toast.success(t('common:success'), {
        description: t('success.orders.orderStatusUpdated'),
      });
    },
    onError: (error: Error) => {
      console.error('Error updating order status:', error.message);
      toast.error(t('common:error'), {
        description: t('error.orders.failedToUpdateOrderStatus'),
      });
    }
  });

  const createReviewMutation = useMutation({
    mutationFn: async () => {
      if (!statusId) throw new Error('Status ID is required');
      const values = getValues();
      const res = await createReview({ ...values, order_id: orderId, status_id: statusId });
      await handleResponse(res, 'reviews', t);
      return res;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders', orderId] });
    },
    onError: (error: Error) => {
      console.error('Error creating review:', error.message);
    }
  });

  const isLoading = updateOrderMutation.isPending || createReviewMutation.isPending;

  async function onSubmit() {
    if (!statusId) return;
    
    try {
      if (hasExistingReview) {
        await updateOrderMutation.mutateAsync();
      } else {
        await createReviewMutation.mutateAsync();
      }
 
    } catch (error) {
      // Error is already handled by the mutation error callbacks
    } finally {
      setOpen(false);
    }
  }

  return (
    <Form {...form}>
      <form className={`flex flex-col gap-4 ${className}`}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <ThemedButton>
              {isLoading ? <Spinner className="w-4 h-4" /> : null}
              {t('details.dialog.button')}
            </ThemedButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-col gap-2">
              <DialogTitle>
                {hasExistingReview ? t('details.dialog.titleCompleteOrder') : t('details.dialog.title')}
              </DialogTitle>
              <DialogDescription>
                {hasExistingReview ? t('details.dialog.descriptionCompleteOrder') : t('details.dialog.description')}
              </DialogDescription>
            </DialogHeader>
            {!hasExistingReview && (
              <div className="flex flex-col gap-4">
                <FormField
                  name="rating"
                  control={form.control}
                  render={({ field: { value } }) => (
                    <div className="flex gap-4">
                      {Array.from({ length: 5 }, (_, i) => i + 1).map(
                        (rating) => (
                          <button
                            key={rating}
                            className="w-fit bg-transparent p-0"
                            onMouseEnter={() => handleMouseEnter(rating)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(rating)}
                          >
                            {rating <= (hoveredRating ?? value ?? 0) ? (
                              <StarFilledIcon className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarFilledIcon className="h-5 w-5 text-yellow-200" />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                />

                <div className="flex flex-col gap-4">
                  <Label htmlFor="content" className="text-left">
                    {t('details.dialog.label')}
                  </Label>
                  <FormField
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <ThemedTextarea
                        id="content"
                        className="col-span-3"
                        placeholder={t('details.dialog.placeholder')}
                        rows={5}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <ThemedButton type="button" onClick={onSubmit} disabled={isLoading}>
                {isLoading ? <Spinner className="w-4 h-4" /> : null}
                {t('details.dialog.button')}
              </ThemedButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}
