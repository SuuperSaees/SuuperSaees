'use client';

import { useState } from 'react';

import { UseMutationResult } from '@tanstack/react-query';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@kit/ui/form';
import { useMultiStepFormContext } from '@kit/ui/multi-step-form';
import { Spinner } from '@kit/ui/spinner';

import UploadFileComponent from '~/components/ui/files-input';
import { Brief } from '~/lib/brief.types';

import BriefCard from './brief-card';
import ClientAssignation from './client-assignation';
import { OrderBriefs } from './order-briefs';

interface BriefCompletionFormProps {
  brief: Brief.Relationships.Services.Response | null;
  orderMutation: UseMutationResult<
    void,
    Error,
    {
      values: {
        briefSelection: {
          selectedBriefId: string;
        };
        briefCompletion: {
          uuid: string;
          fileIds: string[];
          brief_responses: Record<string, string | undefined | Date>;
          description?: string | undefined;
          title?: string | undefined;
          order_followers?: string[] | undefined;
        };
      };
      fileIds: string[];
    },
    unknown
  >;
  uniqueId: string;
  userRole: string;
  clientOrganizationId?: string | null;
  agencyId?: string | null;
  setClientOrganizationId: (clientOrganizationId: string) => void;
}

export default function BriefCompletionForm({
  brief,
  uniqueId,
  orderMutation,
  userRole,
  clientOrganizationId,
  agencyId,
  setClientOrganizationId,
}: BriefCompletionFormProps) {
  const { t } = useTranslation('orders');
  const { form, prevStep } = useMultiStepFormContext();
  const [_uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);

  const handleFileIdsChange = (fileIds: string[]) => {
    setUploadedFileIds(fileIds);
    form.setValue('briefCompletion.fileIds', fileIds);
  };

  return (
    <Form {...form}>
      <div className="flex h-full max-h-full w-full flex-col justify-between gap-8">
        <div className="no-scrollbar flex h-full flex-wrap gap-16 overflow-y-auto lg:flex-nowrap">
          <div className="flex w-full max-w-full shrink-0 flex-col items-start justify-between gap-16 lg:sticky lg:top-0 lg:h-fit lg:max-w-xs">
            <BriefCard brief={brief} />
            {(userRole === 'agency_owner' ||
              userRole === 'agency_project_manager' ||
              userRole === 'agency_member') && (
              <ClientAssignation
                onSelectOrganization={setClientOrganizationId}
              />
            )}
          </div>

          <div className="flex h-full max-h-full w-full flex-col justify-between gap-8">
            {!brief && (
              <>
                <FormField
                  name="briefCompletion.title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedInput
                          {...field}
                          placeholder={t('creation.form.titlePlaceholder')}
                          className="focus-visible:ring-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="briefCompletion.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <ThemedTextarea
                          {...field}
                          placeholder={t(
                            'creation.form.descriptionPlaceholder',
                          )}
                          rows={5}
                          className="focus-visible:ring-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {clientOrganizationId && agencyId && (
                  <UploadFileComponent
                    bucketName="orders"
                    uuid={uniqueId}
                    onFileIdsChange={handleFileIdsChange}
                  />
                )}
              </>
            )}
            {clientOrganizationId && agencyId && (
              <OrderBriefs
                brief={brief}
                form={form}
                orderId={form.getValues('briefCompletion.uuid')}
              />
            )}
          </div>
        </div>
        <div className="flex w-full justify-between py-4">
          <Button variant={'outline'} type="button" onClick={prevStep}>
            {t('pagination.previous')}
          </Button>

          <ThemedButton type="submit" className="flex gap-2">
            <span>{t('creation.form.submitMessage')}</span>
            {orderMutation.isPending && (
              <Spinner className="h-4 w-4 text-white" />
            )}
          </ThemedButton>
        </div>
      </div>
    </Form>
  );
}
