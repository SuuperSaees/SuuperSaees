'use client';

import React, { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  MultiStepForm,
  MultiStepFormStep,
  createStepSchema,
} from '@kit/ui/multi-step-form';

import EmptyState from '~/components/ui/empty-state';
import { Brief } from '~/lib/brief.types';
import { FormField } from '~/lib/form-field.types';
import { Order } from '~/lib/order.types';
import { handleResponse } from '~/lib/response/handle-response';
import { createOrders } from '~/team-accounts/src/server/actions/orders/create/create-order';
import { generateUUID } from '~/utils/generate-uuid';

import { generateOrderCreationSchema } from '../schemas/order-creation-schema';
import BriefCompletionForm from './brief-completion-form';
import BriefSelectionForm from './brief-selection-form';

type OrderInsert = Omit<
  Order.Insert,
  | 'customer_id'
  | 'client_organization_id'
  | 'agency_id'
  | 'propietary_organization_id'
> & {
  fileIds?: string[];
  uniqueId: string;
};

interface OrderCreationFormProps {
  briefs: Brief.Relationships.Services.Response[];
  userRole: string;
}

const OrderCreationForm = ({ briefs, userRole }: OrderCreationFormProps) => {
  const uniqueId = generateUUID();
  const { t } = useTranslation(['orders', 'responses']);
  const router = useRouter();

  const [formFields, setFormFields] = useState<FormField.Type[]>([]);
  const [orderCreationFormSchema, setOrderCreationFormSchema] = useState(
    generateOrderCreationSchema(briefs.length > 0, t, formFields),
  );

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
        fileIds: [],
        brief_responses: undefined,
        order_followers: undefined,
      },
    },
    mode: 'onChange',
  });

  const orderMutation = useMutation({
    mutationFn: async ({
      values,
      fileIds,
    }: {
      values: z.infer<typeof formSchema>;
      fileIds: string[];
    }) => {
      const {
        brief_responses: _brief_responses,
        order_followers,
        ...newOrder
      } = {
        ...values.briefCompletion,
        fileIds,
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

      const titleFormFieldId = selectedBrief?.form_fields?.find((field) => field.field?.position === 0)?.field?.id;
      const titleFormField = values.briefCompletion.brief_responses[titleFormFieldId ?? ''];

      const res = await createOrders(
        [{...newOrder, title: titleFormField} as OrderInsert],
        briefResponses,
        order_followers,
      );
      await handleResponse(res, 'orders', t);
      if (res.ok) router.push(`/orders/${res?.success?.data?.id}`);
    },
    onError: () => {
      console.error('Error creating the order');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    orderMutation.mutate({
      values: values,
      fileIds: values.briefCompletion.fileIds,
    });
  };

  const selectedBrief =
    briefs.find(
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
              `${userRole === 'agency_owner' || userRole === 'agency_project_manager' || userRole === 'agency_member' ? 'briefs:empty.agency.title' : 'briefs:empty.client.title'}`,
            )}
            description={t(
              `${userRole === 'agency_owner' || userRole === 'agency_project_manager' || userRole === 'agency_member' ? 'briefs:empty.agency.description' : 'briefs:empty.client.description'}`,
            )}
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
        />
      </MultiStepFormStep>
    </MultiStepForm>
  );
};

export default OrderCreationForm;
