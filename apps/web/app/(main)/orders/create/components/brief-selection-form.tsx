'use client';

import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

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
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar briefs basado en el término de búsqueda (nombre, descripción o servicios)
  const filteredBriefs = briefs.filter((brief) =>
    brief.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brief.services?.some((service) => 
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Function to handle selection toggle
  const handleBriefSelection = (id: string) => {
    form.setValue('briefSelection.selectedBriefId', id);
  };

  return (
    <Form {...form}>
      <div className="flex h-full max-h-full  flex-col gap-8">
        <div className="flex w-full max-w-7xl mx-auto p-2 px-3 items-center gap-2 self-stretch rounded-lg border border-[#E4E7EC] bg-[rgba(255,255,255,0.8)]">
          <svg
            className="h-5 w-5 text-gray-400 mr-[8px]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder={t('pagination.search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none focus:outline-none focus:ring-0"
          />
        </div>
        
        <div className="no-scrollbar  w-full overflow-y-auto thin-scrollbar">
          <FormField
            control={form.control}
            name="briefSelection.selectedBriefId"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className='max-w-7xl flex h-full flex-wrap gap-16 lg:flex-nowrap mx-auto w-full'>
                    <div className="flex h-full gap-x-[24px] gap-y-[24px] flex-wrap">
                      {filteredBriefs?.map((brief) => (
                        <div
                          key={brief.id}
                          className=""
                          onClick={() => handleBriefSelection(brief.id)}
                        >
                          <BriefCard 
                            brief={brief} 
                            selected={selectedBriefId === brief.id}
                            SelectIcon={selectedBriefId === brief.id ? CheckboxRoundedFilled : CheckboxRounded}
                          />
                        </div>
                      ))}
                    </div>
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

