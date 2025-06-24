'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  MultiStepForm,
  MultiStepFormStep,
  createStepSchema,
} from '@kit/ui/multi-step-form';
import { Spinner } from '@kit/ui/spinner';

import EmptyState from '~/components/ui/empty-state';
import { Brief } from '~/lib/brief.types';
import { FormField } from '~/lib/form-field.types';
import { Order } from '~/lib/order.types';
import { handleResponse } from '~/lib/response/handle-response';
import { createBrief } from '~/team-accounts/src/server/actions/briefs/create/create-briefs';
import {
  insertFilesInFolder,
} from '~/team-accounts/src/server/actions/files/create/create-file';
import { createOrder } from '~/team-accounts/src/server/actions/orders/create/create-order';
import { generateUUID } from '~/utils/generate-uuid';

import { generateOrderCreationSchema } from '../schemas/order-creation-schema';
import BriefCompletionForm from './brief-completion-form';
import BriefSelectionForm from './brief-selection-form';
import { useUserWorkspace } from '@kit/accounts/hooks/use-user-workspace';
import { File } from '~/lib/file.types';

type OrderInsert = Omit<
  Order.Insert,
  | 'customer_id'
  | 'client_organization_id'
  | 'agency_id'
  | 'propietary_organization_id'
> 

interface OrderCreationFormProps {
  briefs: Brief.Relationships.Services.Response[];
  userRole: string;
}

const OrderCreationForm = ({ briefs, userRole }: OrderCreationFormProps) => {
  const uniqueId = generateUUID();
  const { t } = useTranslation(['orders', 'responses', 'briefs']);
  const router = useRouter();

  const [formFields, setFormFields] = useState<FormField.Type[]>([]);
  const [orderCreationFormSchema, setOrderCreationFormSchema] = useState(
    generateOrderCreationSchema(briefs.length > 0, t, formFields),
  );

  const { agency, organization, workspace: userWorkspace } = useUserWorkspace();
  const [clientOrganizationId, setClientOrganizationId] = useState<
    string | undefined
  >(organization?.id ?? undefined);
  const agencyId = agency ? agency.id : organization?.id;

  const userRoleValidation = new Set([
    'agency_owner',
    'agency_project_manager',
    'agency_member',
  ]);

  const formSchema = createStepSchema({
    briefSelection: z.object({
      selectedBriefId: z.string().min(1),
    }),
    briefCompletion: orderCreationFormSchema,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      briefSelection: {
        selectedBriefId: '',
      },
      briefCompletion: {
        uuid: uniqueId,
        title: '',
        description: '',
        files: [],
        brief_responses: undefined,
        order_followers: undefined,
      },
    },
    mode: 'onChange',
  });
  const queryClient = useQueryClient();
  const orderMutation = useMutation({
    mutationFn: async ({
      values,
    }: {
      values: z.infer<typeof formSchema>;
    }) => {
      const {
        brief_responses: _brief_responses,
        order_followers,
        ...newOrder
      } = {
        ...values.briefCompletion,
      };
      // Transform the data into the shape required by the server
      let briefResponses: Brief.Relationships.FormFieldResponses[] = [];
      if (formFields.length > 0) {
        briefResponses = formFields
          .map((field) => {
            if (!field?.id) return null;
            return {
              form_field_id: field.id,
              brief_id: values.briefSelection.selectedBriefId,
              order_id: values.briefCompletion.uuid,
              response: values.briefCompletion.brief_responses[field.id] ?? '',
            };
          })
          .filter(
            (response): response is Brief.Relationships.FormFieldResponses =>
              response !== null,
          );
      }

      const titleFormFieldId = selectedBrief?.form_fields?.find(
        (field) => field.field?.position === 0,
      )?.field?.id;
      const titleFormField =
        values.briefCompletion.brief_responses[titleFormFieldId ?? ''];

      const res = await createOrder(
        { ...newOrder, title: titleFormField } as OrderInsert,
        briefResponses,
        order_followers,
      );
      // Since we're creating files for a order, the file need to be placed into the respective order folder
      if (
        values.briefCompletion.files.length > 0 &&
        clientOrganizationId &&
        agencyId
      ) {
        const filesToInsert:File.Insert[] = values.briefCompletion.files.map(
          (file) => ({
            id: file.id ?? undefined,
            name: file.name ?? '',
            size: file.size ?? 0,
            type: file.type ?? '',
            url: file.url ?? '',
            user_id: userWorkspace?.id ?? '',
          }),
        );

        await insertFilesInFolder(values.briefCompletion.uuid, filesToInsert, clientOrganizationId, agencyId).catch((error) => {
          console.error('Error creating folder files:', error);
          return
        });
      }
      await handleResponse(res, 'orders', t);
      if (res.ok) {
        router.push(`/orders/${res?.success?.data?.id}`);
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
      }
    },
    onError: () => {
      console.error('Error creating the order');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    orderMutation.mutate({
      values: values,
    });
  };

  const selectedBrief =
    briefs?.find(
      (brief) => brief.id === form.getValues('briefSelection.selectedBriefId'),
    ) ?? null;

  // see errors in form
  useEffect(() => {
    if (selectedBrief) {
      const fields = (selectedBrief.form_fields?.map((field) => field.field) ??
        []) as FormField.Type[];
      setFormFields(fields);
      setOrderCreationFormSchema(
        generateOrderCreationSchema(briefs.length > 0, t, fields),
      );
    }
  }, [selectedBrief, t, briefs.length]);

  const [isLoading, setIsLoading] = useState(false);

  const briefMutation = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const res = await createBrief({});
      await handleResponse(res, 'briefs', t);

      if (res.ok && res?.success?.data) {
        window.location.href = `/briefs/${res?.success?.data?.id}`;
      }
    },
    onError: () => {
      setIsLoading(false);
      console.error('Error creating the brief from the table');
    },
  });

  if (isLoading) {
    return (
      <div className="h-full [&>*]:h-full">
        <EmptyState
          imageSrc="/images/illustrations/Illustration-cloud.svg"
          title={t(
            userRoleValidation.has(userRole)
              ? 'briefs:empty.agency.title'
              : 'briefs:empty.client.title',
          )}
          description={t(
            userRoleValidation.has(userRole)
              ? 'briefs:empty.agency.description'
              : 'briefs:empty.client.description',
          )}
          button={
            <ThemedButton
              onClick={async () => await briefMutation.mutateAsync()}
              disabled={briefMutation.isPending}
              className="flex items-center gap-2"
            >
              <span>{t('briefs:createBrief')}</span>
              <Spinner className="h-4 w-4" />
            </ThemedButton>
          }
        />
      </div>
    );
  }

  return (
    <MultiStepForm
      schema={formSchema}
      form={form}
      onSubmit={onSubmit}
      className="h-full [&>*]:h-full"
    >
      <MultiStepFormStep name="briefSelection" className="h-full [&>*]:h-full">
        {!briefs.length ? (
          <EmptyState
            imageSrc="/images/illustrations/Illustration-cloud.svg"
            title={t(
              userRoleValidation.has(userRole)
                ? 'briefs:empty.agency.title'
                : 'briefs:empty.client.title',
            )}
            description={t(
              userRoleValidation.has(userRole)
                ? 'briefs:empty.agency.description'
                : 'briefs:empty.client.description',
            )}
            button={
              userRole === 'agency_owner' ||
              userRole === 'agency_project_manager' ? (
                <ThemedButton
                  onClick={async () => await briefMutation.mutateAsync()}
                  disabled={briefMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {briefMutation.isPending ? (
                    <>
                      <span>{t('briefs:createBrief')}</span>
                      <Spinner className="h-4 w-4" />
                    </>
                  ) : (
                    <span>{t('briefs:createBrief')}</span>
                  )}
                </ThemedButton>
              ) : undefined
            }
          />
        ) : (
          <BriefSelectionForm briefs={briefs} />
        )}
      </MultiStepFormStep>

      <MultiStepFormStep name="briefCompletion" className="h-full [&>*]:h-full">
        <BriefCompletionForm
          brief={selectedBrief}
          uniqueId={uniqueId}
          orderMutation={orderMutation}
          userRole={userRole}
          clientOrganizationId={clientOrganizationId}
          agencyId={agencyId}
          setClientOrganizationId={setClientOrganizationId}
        />
      </MultiStepFormStep>
    </MultiStepForm>
  );
};

export default OrderCreationForm;
