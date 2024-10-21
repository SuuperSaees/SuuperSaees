'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';

// import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { useMultiStepFormContext } from '@kit/ui/multi-step-form';

import {
  CheckboxRounded,
  CheckboxRoundedFilled,
} from '~/components/icons/icons';
import { Brief } from '~/lib/brief.types';

import BriefCard from './brief-card';

interface BriefSelectionFormProps {
  briefs: Brief.Relationships.Services.Response[];
}

export default function BriefSelectionForm({
  briefs,
}: BriefSelectionFormProps) {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const selectedBriefId = form.watch('briefSelection.selectedBriefId');
  const { t } = useTranslation(['orders', 'common']);
  // Function to handle selection toggle
  const handleBriefSelection = (id: string) => {
    form.setValue('briefSelection.selectedBriefId', id);
  };

  return (
    <Form {...form}>
      <div className="flex h-full max-h-full w-full flex-col justify-between gap-8">
        <div className="no-scrollbar h-full overflow-y-auto thin-scrollbar">
          <FormField
            control={form.control}
            name="briefSelection.selectedBriefId"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="flex h-full max-h-full w-full flex-wrap gap-8">
                    {briefs?.map((brief) => (
                      <div
                        key={brief.id}
                        className="relative cursor-pointer"
                        onClick={() => handleBriefSelection(brief.id)}
                      >
                        {/* Render icon based on selection */}
                        {selectedBriefId === brief.id ? (
                          <CheckboxRoundedFilled className="absolute right-4 top-4 z-10 h-5 w-5" />
                        ) : (
                          <CheckboxRounded className="absolute right-4 top-4 z-10 h-5 w-5" />
                        )}

                        <BriefCard brief={brief} />
                      </div>
                    ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex w-full shrink-0 justify-between py-4">
          {/* <Button variant={'outline'} type="button">
            {t('pagination.previous')}
          </Button> */}
          <ThemedButton
            type="button"
            onClick={nextStep}
            disabled={!isStepValid()}
            className="ml-auto"
          >
            {t('pagination.next')}
          </ThemedButton>
        </div>
      </div>
    </Form>
  );
}
