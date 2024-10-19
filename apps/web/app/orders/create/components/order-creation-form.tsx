'use client';

import React from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import {
  MultiStepForm,
  MultiStepFormStep,
  createStepSchema,
} from '@kit/ui/multi-step-form';

import { Brief } from '~/lib/brief.types';
import { generateUUID } from '~/utils/generate-uuid';

import { generateOrderCreationSchema } from '../schemas/order-creation-schema';
import BriefSelectionForm from './brief-selection-form';
import { useMutation } from '@tanstack/react-query';
import { createOrders } from '~/team-accounts/src/server/actions/orders/create/create-order';
import { toast } from 'sonner';
import { Order } from '~/lib/order.types';
import BriefCompletionForm from './brief-completion-form';

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
  briefs: Brief.Response[];
  userRole: string;
}

const OrderCreationForm = ({ briefs, userRole }: OrderCreationFormProps) => {

  const uniqueId = generateUUID();
  const { t } = useTranslation('orders');

  const orderCreationFormSchema = generateOrderCreationSchema(
    briefs.length > 0,
    t,
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
    mutationFn: async ({values, fileIds}: {
      values: z.infer<typeof orderCreationFormSchema>;
      fileIds: string[];
    }) => {
      const newOrder = {
        ...values,
        fileIds,
      };
      delete newOrder.brief_responses;
      delete newOrder.order_followers;
      await createOrders([newOrder as OrderInsert], values.brief_responses, values.order_followers);
    },
    onError: () => {
      toast('Error', {
        description: 'There was an error creating the order.',
      });
    },
    onSuccess: () => {
      toast('Success', {
        description: 'The order has been created.',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    orderMutation.mutate({values: values.briefCompletion, fileIds: values.briefCompletion.fileIds});
  };
  const selectedBriefs = briefs.filter((brief) => brief.id === form.getValues('briefSelection.selectedBriefId'));
  
  return (
    <MultiStepForm schema={formSchema} form={form} onSubmit={onSubmit} className='h-full [&>*]:h-full '>
      
      <MultiStepFormStep name='briefSelection' className='h-full [&>*]:h-full '>
        <BriefSelectionForm briefs={briefs} />
      </MultiStepFormStep>

      <MultiStepFormStep name='briefCompletion' className='h-full [&>*]:h-full'>
        <BriefCompletionForm briefs={selectedBriefs } uniqueId={uniqueId} orderMutation={orderMutation} userRole={userRole} />
      </MultiStepFormStep>

      
    </MultiStepForm>
  );
};

export default OrderCreationForm;
