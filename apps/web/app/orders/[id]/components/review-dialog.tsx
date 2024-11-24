'use client';

import { useState } from 'react';



import { zodResolver } from '@hookform/resolvers/zod';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Form, FormField } from '@kit/ui/form';
import { Label } from '@kit/ui/label';

import { createReview } from '../../../../../../packages/features/team-accounts/src/server/actions/review/create/create.review';


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

export function ReviewDialog({ orderId, className }: { orderId: number, className?: string }) {
  const form = useForm<z.infer<typeof reviewSchema>>({
    mode: 'onChange',
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: null, content: '' },
  });
  const { setValue, getValues } = form;

  const { t } = useTranslation();
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleMouseEnter = (rating: number) => setHoveredRating(rating);
  const handleMouseLeave = () => setHoveredRating(null);
  const handleClick = (rating: number) => {
    setValue('rating', rating);
  };

  async function onSubmit() {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    const values = getValues();
    try {
      await createReview({ ...values, order_id: orderId });
      toast.success('Success', {
        description: 'Review created successfully',
      });
    } catch (error) {
      toast.error('Error', {
        description: 'Error creating the review',
      });
    }
  }
  return (
    <Form {...form}>
      <form className={`flex flex-col gap-4 ${className}`}>
        <Dialog>
          <DialogTrigger asChild>
            <ThemedButton
              variant="outline"
              className="w-full bg-primary text-white hover:bg-primary/90 hover:text-white"
            >
              {t('details.dialog.button')}
            </ThemedButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader className="flex flex-col gap-2">
              <DialogTitle>{t('details.dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('details.dialog.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              {/*Review rating to 5*/}
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
            <DialogFooter>
              <DialogClose>
                <ThemedButton type="button" onClick={onSubmit}
                
                >
                  {t('details.dialog.button')}
                </ThemedButton>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </Form>
  );
}