'use client';

import React, { useState } from 'react';



import Image from 'next/image';
import BriefConnectionStep from './step-brief-connection';
import { useRouter } from 'next/navigation';



import { zodResolver } from '@hookform/resolvers/zod';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { createService } from 'node_modules/@kit/team-accounts/src/server/actions/services/create/create-service';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';


import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  MultiStepForm,
  MultiStepFormContextProvider,
  MultiStepFormHeader,
  MultiStepFormStep,
  createStepSchema,
  useMultiStepFormContext,
} from '@kit/ui/multi-step-form';
import { Spinner } from '@kit/ui/spinner';
import { Stepper } from '@kit/ui/stepper';
import { Textarea } from '@kit/ui/textarea';

import UploadImageComponent from '../../../../../../packages/features/team-accounts/src/server/actions/services/create/upload-image';
import CreditBasedRecurringSubscription from './recurring_subscription/credit_based';
import StandardRecurringSubscription from './recurring_subscription/standard';
import TimeBasedRecurringSubscription from './recurring_subscription/time_based';
import CreditBased from './single_sale/credit_based';
import Standard from './single_sale/standard';
import TimeBased from './single_sale/time_based';

if (!process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY) {
  throw new Error('Stripe public key is not defined in environment variables');
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

export const FormSchema = createStepSchema({
  step_type_of_service: z.object({
    single_sale: z.boolean().default(false),
    recurring_subscription: z.boolean().default(false),
  }),
  step_service_details: z.object({
    service_image: z.string().optional(),
    service_name: z.string().min(2).max(50),
    service_description: z.string().min(2).max(500),
  }),
  step_service_price: z.object({
    standard: z.boolean().default(false),
    purchase_limit: z.number(),
    allowed_orders: z.number(),
    time_based: z.boolean().default(false),
    hours: z.number(),
    credit_based: z.boolean().default(false),
    credits: z.number(),
    price: z.number(),
    recurrence: z.string(),
    test_period: z.boolean().default(false),
    test_period_duration: z.number(),
    test_period_duration_unit_of_measurement: z.string(),
    test_period_price: z.number(),
    max_number_of_simultaneous_orders: z.number(),
    max_number_of_monthly_orders: z.number(),
  }),
  step_connect_briefs: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })),
});

type FormValues = z.infer<typeof FormSchema>;

export function MultiStepFormDemo() {
  const { t } = useTranslation('services');
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      step_type_of_service: {
        single_sale: true,
        recurring_subscription: false,
      },
      step_service_details: {
        service_image: undefined,
        service_name: '',
        service_description: '',
      },
      step_service_price: {
        standard: true,
        purchase_limit: 0,
        allowed_orders: 0,
        time_based: false,
        hours: 0,
        credit_based: false,
        credits: 0,
        price: 0,
        recurrence: '',
        test_period: false,
        test_period_duration: 0,
        test_period_duration_unit_of_measurement: 'days',
        test_period_price: 0,
        max_number_of_simultaneous_orders: 0,
        max_number_of_monthly_orders: 0,
      },
    },
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  async function onSubmit() {
    // await createService({
    //   ...form.getValues(),
    // });
    // window.location.reload();
  }

  return (
    <MultiStepForm
      className={'space-y-10 rounded-xl p-8'}
      schema={FormSchema}
      form={form}
      onSubmit={onSubmit}
    >
      <MultiStepFormHeader
        className={'flex w-full flex-col justify-center space-y-6'}
      >
        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => (
            <>
              <div className="mb-[32px] flex items-center justify-between">
                <h2
                  className={
                    'font-inter text-[30px] font-semibold leading-8 text-gray-900'
                  }
                >
                  {currentStepIndex === 0
                    ? t('step_type_of_service_title')
                    : currentStepIndex === 1
                      ? t('step_service_details')
                      : currentStepIndex === 2
                        ? t('step_service_price')
                        : t('step_connect_briefs')}
                </h2>
              </div>
              <Stepper
                variant={'customDots'}
                steps={[
                  t('step_type_of_service'),
                  t('step_service_details'),
                  t('step_service_price'),
                  t('step_connect_briefs'),
                ]}
                currentStep={currentStepIndex}
              />
            </>
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>

      <MultiStepFormStep name="step_type_of_service">
        <TypeOfServiceStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="step_service_details">
        <DetailsStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="step_service_price">
        <PricingStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="connect_briefs">
        <BriefConnectionStep  />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}

function TypeOfServiceStep() {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const { t } = useTranslation('services');
  const { theme_color } = useOrganizationSettings();
  const router = useRouter();
  type CheckboxName =
    | 'step_type_of_service.single_sale'
    | 'step_type_of_service.recurring_subscription';

  const handleCheckboxChange = (name: CheckboxName) => (checked: boolean) => {
    form.setValue('step_type_of_service.single_sale', false);
    form.setValue('step_type_of_service.recurring_subscription', false);
    form.setValue(name, checked);
  };

  const getCheckboxClass = (isSelected: boolean) =>
    isSelected
      ? 'flex flex-col w-[505.564px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[2.948px] border-brand-600 bg-white'
      : 'flex flex-col w-[505.564px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[1.474px] border-gray-200 bg-white';

  const getStyles = (isSelected: boolean) => ({
    borderColor: isSelected ? (theme_color ?? '#1f1f1f') : '#d9d9d9',
  });

  return (
    <div className="">
      <div className="text-black-600 mb-[32px] h-[20px] w-[343px] text-[16px] font-bold leading-[44px] tracking-[-0.32px]">
        {t('step_type_of_service')}
      </div>
      <Form {...form}>
        <div className={'flex flex-col gap-4'}>
          <div className="flex items-center justify-center gap-[47.17px]">
            <FormField
              control={form.control}
              name="step_type_of_service.single_sale"
              render={({ field }) => (
                <FormItem
                  className={getCheckboxClass(field.value)}
                  style={getStyles(field.value)}
                >
                  <FormControl>
                    <div className="flex gap-[11.792px]">
                      <div
                        className={`flex h-8 w-8 cursor-pointer items-center justify-center border-2 ${
                          field.value
                            ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
                            : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
                        }`}
                        style={
                          field.value
                            ? {
                                borderColor: theme_color ?? '#1f1f1f',
                                backgroundColor: theme_color ?? '#1f1f1f',
                              }
                            : undefined
                        }
                        onClick={() =>
                          handleCheckboxChange(
                            'step_type_of_service.single_sale',
                          )(!field.value)
                        }
                      >
                        {field.value && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
                          {t('single_sale')}
                        </FormLabel>
                        <div>
                          <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
                            {t('single_sale_description')}
                          </FormDescription>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="step_type_of_service.recurring_subscription"
              render={({ field }) => (
                <FormItem
                  className={getCheckboxClass(field.value)}
                  style={getStyles(field.value)}
                >
                  <FormControl>
                    <div className="flex gap-[11.792px]">
                      <div
                        className={`flex h-6 w-8 cursor-pointer items-center justify-center border-2 ${
                          field.value
                            ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
                            : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
                        }`}
                        style={
                          field.value
                            ? {
                                borderColor: theme_color ?? '#1f1f1f',
                                backgroundColor: theme_color ?? '#1f1f1f',
                              }
                            : undefined
                        }
                        onClick={() =>
                          handleCheckboxChange(
                            'step_type_of_service.recurring_subscription',
                          )(!field.value)
                        }
                      >
                        {field.value && (
                          <div className="h-2 w-2 rounded-full bg-white" />
                        )}
                      </div>
                      <div>
                        <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
                          {t('recurring_subscription')}
                        </FormLabel>
                        <div>
                          <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
                            {t('recurring_subscription_description')}
                          </FormDescription>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4 flex justify-between space-x-2">
            <ThemedButton type="button" onClick={()=> router.push('/services')}>
              {t('previous')}
            </ThemedButton>
            <ThemedButton onClick={nextStep} disabled={!isStepValid()}>
              {t('next')}
            </ThemedButton>
          </div>
        </div>
      </Form>
    </div>
  );
}

function DetailsStep() {
  const { t } = useTranslation('services');
  const { form, nextStep, prevStep, isStepValid } = useMultiStepFormContext();
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >(form.getValues('step_service_details.service_image') || null);

  const handleImageUpload = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    form.setValue('step_service_details.service_image', imageUrl);
  };

  return (
    <Form {...form}>
      <div className={'flex gap-[36px]'}>
        <div className="h-[190px] w-[390px] rounded-md bg-gray-300">
          {selectedImage && (
            <Image
              src={selectedImage as string}
              alt="Selected"
              width={390}
              height={190}
              className="h-[190px] w-[390px] rounded-md bg-gray-300 object-cover"
            />
          )}
        </div>
        <div className="w-1/2 p-[36px]">
          <UploadImageComponent onImageUpload={handleImageUpload} />
        </div>
      </div>
      <FormField
        name="step_service_details.service_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('service_name')}</FormLabel>
            <FormControl>
              <Input {...field} className="flex w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="step_service_details.service_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t('service_description')}</FormLabel>
            <FormControl>
              <Textarea {...field} className="flex w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="mt-4 flex justify-between space-x-2">
        <ThemedButton type="button" onClick={prevStep}>
          {t('previous')}
        </ThemedButton>
        <ThemedButton onClick={nextStep} disabled={!isStepValid()}>
          {t('next')}
        </ThemedButton>
      </div>
    </Form>
  );
}

//At this time we will only handle standard for one-time payment and subscription

// function PricingStep() {
//   const { t } = useTranslation('services');
//   // const { form, nextStep, prevStep } = useMultiStepFormContext();
//   const { form, prevStep } = useMultiStepFormContext();

//   type CheckboxName =
//     | 'step_service_price.standard'
//     | 'step_service_price.time_based'
//     | 'step_service_price.credit_based';

//   const handleCheckboxChange = (name: CheckboxName) => (checked: boolean) => {
//     form.setValue('step_service_price.standard', false);
//     form.setValue('step_service_price.time_based', false);
//     form.setValue('step_service_price.credit_based', false);
//     form.setValue(name, checked);
//   };

//   const getCheckboxClass = (isSelected: boolean) =>
//     isSelected
//       ? 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[2.948px] border-brand-600 bg-white'
//       : 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[1.474px] border-gray-200 bg-white';

//   async function createServiceFunction() {
//     await createService({
//       ...form.getValues(),
//     });
//     // window.location.reload();
//   }

//   return (
//     <Form {...form}>
//       <div className={'flex flex-col gap-4'}>
//         <div className="flex items-center justify-between gap-[22px]">
//           <FormField
//             control={form.control}
//             name="step_service_price.standard"
//             render={({ field }) => (
//               <FormItem className={getCheckboxClass(field.value)}>
//                 <FormControl>
//                   <div className="flex gap-[11.792px]">
//                     <div
//                       className={`flex h-8 w-8 cursor-pointer items-center justify-center border-2 ${
//                         field.value
//                           ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
//                           : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
//                       }`}
//                       onClick={() =>
//                         handleCheckboxChange('step_service_price.standard')(
//                           !field.value,
//                         )
//                       }
//                     >
//                       {field.value && (
//                         <div className="h-2 w-2 rounded-full bg-white" />
//                       )}
//                     </div>
//                     <div>
//                       <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
//                         {t('standard')}
//                       </FormLabel>
//                       <div>
//                         <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
//                           {t('standard_description')}
//                         </FormDescription>
//                       </div>
//                     </div>
//                   </div>
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="step_service_price.time_based"
//             render={({ field }) => (
//               <FormItem className={getCheckboxClass(field.value)}>
//                 <FormControl>
//                   <div className="flex gap-[11.792px]">
//                     <div
//                       className={`flex h-6 w-8 cursor-pointer items-center justify-center border-2 ${
//                         field.value
//                           ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
//                           : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
//                       }`}
//                       onClick={() =>
//                         handleCheckboxChange('step_service_price.time_based')(
//                           !field.value,
//                         )
//                       }
//                     >
//                       {field.value && (
//                         <div className="h-2 w-2 rounded-full bg-white" />
//                       )}
//                     </div>
//                     <div>
//                       <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
//                         {t('time_based')}
//                       </FormLabel>
//                       <div>
//                         <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
//                           {t('time_based_description')}
//                         </FormDescription>
//                       </div>
//                     </div>
//                   </div>
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="step_service_price.credit_based"
//             render={({ field }) => (
//               <FormItem className={getCheckboxClass(field.value)}>
//                 <FormControl>
//                   <div className="flex gap-[11.792px]">
//                     <div
//                       className={`flex h-6 w-8 cursor-pointer items-center justify-center border-2 ${
//                         field.value
//                           ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
//                           : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
//                       }`}
//                       onClick={() =>
//                         handleCheckboxChange('step_service_price.credit_based')(
//                           !field.value,
//                         )
//                       }
//                     >
//                       {field.value && (
//                         <div className="h-2 w-2 rounded-full bg-white" />
//                       )}
//                     </div>
//                     <div>
//                       <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
//                         {t('credit_based')}
//                       </FormLabel>
//                       <div>
//                         <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
//                           {t('credit_based_description')}
//                         </FormDescription>
//                       </div>
//                     </div>
//                   </div>
//                 </FormControl>
//               </FormItem>
//             )}
//           />
//         </div>

//           {form.watch('step_service_price.standard') &&
//             form.watch('step_type_of_service.single_sale') && (
//               <>
//                 <Standard />
//               </>
//             )}

//           {form.watch('step_service_price.standard') &&
//             form.watch('step_type_of_service.recurring_subscription') && (
//               <>
//                 <StandardRecurringSubscription />
//               </>
//             )}

//           {form.watch('step_service_price.time_based') &&
//             form.watch('step_type_of_service.single_sale') && (
//               <>
//                 <TimeBased />
//               </>
//             )}

//           {form.watch('step_service_price.time_based') &&
//             form.watch('step_type_of_service.recurring_subscription') && (
//               <>
//                 <TimeBasedRecurringSubscription />
//               </>
//             )}

//           {form.watch('step_service_price.credit_based') &&
//             form.watch('step_type_of_service.single_sale') && (
//               <>
//                 <CreditBased />
//               </>
//             )}

//           {form.watch('step_service_price.credit_based') &&
//             form.watch('step_type_of_service.recurring_subscription') && (
//               <>
//                 <CreditBasedRecurringSubscription />
//               </>
//             )}

//       </div>

//       <div className="mt-4 flex justify-between space-x-2">
//         <ThemedButton type="button" variant="outline" onClick={prevStep}>
//           {t('previous')}
//         </ThemedButton>

//         {/* <ThemedButton onClick={nextStep}>{t('next')}</ThemedButton> */}
//         {/* <ThemedButton type='submit' >{t('createService')}</ThemedButton> */}
//         <Link
//           // type="button"
//           onClick={createServiceFunction}
//           href={'/services'}
//           className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
//         >
//           {t('createService')}
//         </Link>
//       </div>
//     </Form>
//   );
// }

function PricingStep() {
  const { t } = useTranslation('services');
  // const { form, nextStep, prevStep } = useMultiStepFormContext();
  const { form, nextStep, prevStep, isStepValid } = useMultiStepFormContext();
  const router = useRouter();
  

  // type CheckboxName =
  //   | 'step_service_price.standard'
  //   | 'step_service_price.time_based'
  //   | 'step_service_price.credit_based';

  // const handleCheckboxChange = (name: CheckboxName) => (checked: boolean) => {
  //   form.setValue('step_service_price.standard', false);
  //   form.setValue('step_service_price.time_based', false);
  //   form.setValue('step_service_price.credit_based', false);
  //   form.setValue(name, checked);
  // };

  // const getCheckboxClass = (isSelected: boolean) =>
  //   isSelected
  //     ? 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[2.948px] border-brand-600 bg-white'
  //     : 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[1.474px] border-gray-200 bg-white';

  async function handleCreateService() {
    try {
      await createService({
        ...form.getValues(),
      });
      toast('Success', {
        description: 'Service created successfully',
      });

      router.push('/services');
    } catch (error) {
      toast('Error', {
        description: 'Error creating service',
      });
    }
  }
  const createServiceMutation = useMutation({
    mutationFn: handleCreateService,
  });

  return (
    <Form {...form}>
      <div className={'flex flex-col gap-4'}>
        {/* <div className="flex items-center justify-between gap-[22px]">
          <FormField
            control={form.control}
            name="step_service_price.standard"
            render={({ field }) => (
              <FormItem className={getCheckboxClass(field.value)}>
                <FormControl>
                  <div className="flex gap-[11.792px]">
                    <div
                      className={`flex h-8 w-8 cursor-pointer items-center justify-center border-2 ${
                        field.value
                          ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
                          : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
                      }`}
                      onClick={() =>
                        handleCheckboxChange('step_service_price.standard')(
                          !field.value,
                        )
                      }
                    >
                      {field.value && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
                        {t('standard')}
                      </FormLabel>
                      <div>
                        <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
                          {t('standard_description')}
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="step_service_price.time_based"
            render={({ field }) => (
              <FormItem className={getCheckboxClass(field.value)}>
                <FormControl>
                  <div className="flex gap-[11.792px]">
                    <div
                      className={`flex h-6 w-8 cursor-pointer items-center justify-center border-2 ${
                        field.value
                          ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
                          : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
                      }`}
                      onClick={() =>
                        handleCheckboxChange('step_service_price.time_based')(
                          !field.value,
                        )
                      }
                    >
                      {field.value && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
                        {t('time_based')}
                      </FormLabel>
                      <div>
                        <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
                          {t('time_based_description')}
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="step_service_price.credit_based"
            render={({ field }) => (
              <FormItem className={getCheckboxClass(field.value)}>
                <FormControl>
                  <div className="flex gap-[11.792px]">
                    <div
                      className={`flex h-6 w-8 cursor-pointer items-center justify-center border-2 ${
                        field.value
                          ? 'flex h-[23.583px] w-[23.583px] items-center justify-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600 p-[7.37px]'
                          : 'h-[23.583px] w-[47.166px] rounded-[5.896px] border-[1.474px] border-gray-300'
                      }`}
                      onClick={() =>
                        handleCheckboxChange('step_service_price.credit_based')(
                          !field.value,
                        )
                      }
                    >
                      {field.value && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <div>
                      <FormLabel className="font-inter text-[20.635px] font-medium leading-[29.479px] text-gray-700">
                        {t('credit_based')}
                      </FormLabel>
                      <div>
                        <FormDescription className="font-inter text-[20.635px] font-normal leading-[29.479px] text-gray-600">
                          {t('credit_based_description')}
                        </FormDescription>
                      </div>
                    </div>
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div> */}

        {form.watch('step_service_price.standard') &&
          form.watch('step_type_of_service.single_sale') && (
            <>
              <Standard />
            </>
          )}

        {form.watch('step_service_price.standard') &&
          form.watch('step_type_of_service.recurring_subscription') && (
            <>
              <StandardRecurringSubscription />
            </>
          )}

        {form.watch('step_service_price.time_based') &&
          form.watch('step_type_of_service.single_sale') && (
            <>
              <TimeBased />
            </>
          )}

        {form.watch('step_service_price.time_based') &&
          form.watch('step_type_of_service.recurring_subscription') && (
            <>
              <TimeBasedRecurringSubscription />
            </>
          )}

        {form.watch('step_service_price.credit_based') &&
          form.watch('step_type_of_service.single_sale') && (
            <>
              <CreditBased />
            </>
          )}

        {form.watch('step_service_price.credit_based') &&
          form.watch('step_type_of_service.recurring_subscription') && (
            <>
              <CreditBasedRecurringSubscription />
            </>
          )}
      </div>

      <div className="mt-4 flex justify-between space-x-2">
        <ThemedButton type="button" disabled={createServiceMutation.isPending} onClick={prevStep}>
          {t('previous')}
        </ThemedButton>
        <ThemedButton onClick={nextStep} disabled={!isStepValid()}>
          {t('next')}
        </ThemedButton>
        {/* <ThemedButton
          onClick={() => createServiceMutation.mutate()}
          className="flex gap-2"
        >
          <span>{t('createService')}</span>
          {createServiceMutation.isPending && (
            <Spinner className="h-4 w-4 text-white" />
          )}
        </ThemedButton> */}
      </div>
    </Form>
  );
}

export default function MultiFormComponent() {
  return (
    <Elements stripe={stripePromise}>
      <MultiStepFormDemo />
    </Elements>
  );
}