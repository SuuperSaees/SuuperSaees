'use client';

import React, { useState } from 'react';

import Image from 'next/image';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
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
import { Stepper } from '@kit/ui/stepper';
import { Textarea } from '@kit/ui/textarea';

import { createService } from '../../../../../../packages/features/team-accounts/src/server/actions/services/create/create-service-server';
import UploadImageComponent from '../../../../../../packages/features/team-accounts/src/server/actions/services/create/upload-image';
import CreditBasedRecurringSubscription from './recurring_subscription/credit_based';
import StandardRecurringSubscription from './recurring_subscription/standard';
import TimeBasedRecurringSubscription from './recurring_subscription/time_based';
import CreditBased from './single_sale/credit_based';
import Standard from './single_sale/standard';
import TimeBased from './single_sale/time_based';
import BriefConnectionStep from './step-brief-connection';

const FormSchema = createStepSchema({
  step_type_of_service: z.object({
    single_sale: z.boolean().default(false),
    recurring_subscription: z.boolean().default(false),
  }),
  step_service_details: z.object({
    service_image: z.string(),
    service_name: z.string().min(2).max(50),
    service_description: z.string().min(2).max(50),
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
    reValidateMode: 'onBlur',
    mode: 'onBlur',
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    await createService({
      ...values,
    });
    window.location.reload();
  }

  return (
    <MultiStepForm
      className={'space-y-10 rounded-xl border p-8'}
      schema={FormSchema}
      form={form}
      onSubmit={onSubmit}
    >
      <MultiStepFormHeader
        className={'flex w-full flex-col justify-center space-y-6'}
      >
        {/* <h2 className={'text-xl font-bold'}>Create your account</h2> */}

        <MultiStepFormContextProvider>
          {({ currentStepIndex }) => (
            <Stepper
              variant={'numbers'}
              steps={[
                t('step_type_of_service'),
                t('step_service_details'),
                t('step_service_price'),
                t('step_connect_briefs'),
              ]}
              currentStep={currentStepIndex}
            />
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

      <MultiStepFormStep name="review">
        <ReviewStep />
      </MultiStepFormStep>

      <MultiStepFormStep name="connect_briefs">
        <BriefConnectionStep />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}

function TypeOfServiceStep() {
  const { form, nextStep, isStepValid } = useMultiStepFormContext();
  const { t } = useTranslation('services');

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

  return (
    <div className="">
      <div className="mb-[32px] h-[20px] w-[343px] text-[16px] font-bold leading-[44px] tracking-[-0.32px] text-brand-600">
        {t('step_type_of_service')}
      </div>
      <Form {...form}>
        <div className={'flex flex-col gap-4'}>
          <div className="flex items-center justify-between gap-4">
            <FormField
              control={form.control}
              name="step_type_of_service.single_sale"
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

          <div className="flex justify-end">
            <Button onClick={nextStep} disabled={!isStepValid()}>
              {t('next')}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

function DetailsStep() {
  const { t } = useTranslation('services');
  const { form, nextStep, prevStep } = useMultiStepFormContext();
  const [selectedImage, setSelectedImage] = useState<
    string | ArrayBuffer | null
  >(null);
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
              className="h-[190px] w-[390px] rounded-md bg-gray-300"
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
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('previous')}
        </Button>
        <Button onClick={nextStep}>{t('next')}</Button>
      </div>
    </Form>
  );
}

function PricingStep() {
  const { t } = useTranslation('services');
  const { form, nextStep, prevStep } = useMultiStepFormContext();

  type CheckboxName =
    | 'step_service_price.standard'
    | 'step_service_price.time_based'
    | 'step_service_price.credit_based';

  const handleCheckboxChange = (name: CheckboxName) => (checked: boolean) => {
    form.setValue('step_service_price.standard', false);
    form.setValue('step_service_price.time_based', false);
    form.setValue('step_service_price.credit_based', false);
    form.setValue(name, checked);
  };

  const getCheckboxClass = (isSelected: boolean) =>
    isSelected
      ? 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[2.948px] border-brand-600 bg-white'
      : 'flex flex-col w-[340px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[1.474px] border-gray-200 bg-white';

  return (
    <Form {...form}>
      <div className={'flex flex-col gap-4'}>
        <div className="flex items-center justify-between gap-[22px]">
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
        </div>
        <div>
          {form.watch('step_service_price.standard') &&
            form.watch('step_type_of_service.single_sale') && (
              <>
                <Standard />
              </>
            )}
        </div>
        <div>
          {form.watch('step_service_price.standard') &&
            form.watch('step_type_of_service.recurring_subscription') && (
              <>
                <StandardRecurringSubscription />
              </>
            )}
        </div>
        <div>
          {form.watch('step_service_price.time_based') &&
            form.watch('step_type_of_service.single_sale') && (
              <>
                <TimeBased />
              </>
            )}
        </div>
        <div>
          {form.watch('step_service_price.time_based') &&
            form.watch('step_type_of_service.recurring_subscription') && (
              <>
                <TimeBasedRecurringSubscription />
              </>
            )}
        </div>

        <div>
          {form.watch('step_service_price.credit_based') &&
            form.watch('step_type_of_service.single_sale') && (
              <>
                <CreditBased />
              </>
            )}
        </div>

        <div>
          {form.watch('step_service_price.credit_based') &&
            form.watch('step_type_of_service.recurring_subscription') && (
              <>
                <CreditBasedRecurringSubscription />
              </>
            )}
        </div>
      </div>

      <div className="mt-4 flex justify-between space-x-2">
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('previous')}
        </Button>

        <Button onClick={nextStep}>{t('next')}</Button>
      </div>
    </Form>
  );
}

function ReviewStep() {
  const { prevStep, form } = useMultiStepFormContext<typeof FormSchema>();
  const values = form.getValues();
  return (
    <div className={'flex flex-col space-y-4'}>
      <div className={'flex flex-col space-y-4'}>
        <div>Great! Please review the values.</div>
        <div className={'flex flex-col space-y-2 text-sm'}>
          <div className="flex flex-col">
            {/* <div><span className='font-bold'>Single Sale: </span> <span>{values.step_type_of_service.single_sale ? 'Sí' : 'No'}</span></div> */}
            <div>
              <span className="font-bold">Recurring Subscription: </span>{' '}
              <span>
                {values.step_type_of_service.recurring_subscription
                  ? 'Sí'
                  : 'No'}
              </span>
            </div>
            <div>
              <span className="font-bold">Service Name: </span>{' '}
              <span>{values.step_service_details.service_name}</span>
            </div>
            {/* <div><span className='font-bold'>Service Image: </span> <span>{values.step_service_details.service_image}</span></div> */}
            <div>
              <span className="font-bold">Service Description: </span>{' '}
              <span>{values.step_service_details.service_description}</span>
            </div>
            {/* <div><span className='font-bold'>Standard: </span> <span>{values.step_service_price.standard ? 'Sí' : 'No'}</span></div> */}
            <div>
              <span className="font-bold">Price: </span>{' '}
              <span>{values.step_service_price.price}</span>
            </div>
            {/* <div><span className='font-bold'>Purchase Limit: </span> <span>{values.step_service_price.purchase_limit}</span></div> */}
            {/* <div><span className='font-bold'>Allowed Orders: </span> <span>{values.step_service_price.allowed_orders}</span></div> */}
            {/* <div><span className='font-bold'>Time Based: </span> <span>{values.step_service_price.time_based ? 'Sí' : 'No'}</span></div> */}
            {/* <div><span className='font-bold'>Hours: </span> <span>{values.step_service_price.hours}</span></div> */}
            <div>
              <span className="font-bold">Credit Based: </span>{' '}
              <span>
                {values.step_service_price.credit_based ? 'Sí' : 'No'}
              </span>
            </div>
            <div>
              <span className="font-bold">Credits: </span>{' '}
              <span>{values.step_service_price.credits}</span>
            </div>
            <div>
              <span className="font-bold">Recurrence: </span>{' '}
              <span>{values.step_service_price.recurrence}</span>
            </div>
            <div>
              <span className="font-bold">Test Period: </span>{' '}
              <span>{values.step_service_price.test_period ? 'Sí' : 'No'}</span>
            </div>
            <div>
              <span className="font-bold">Test Period Duration: </span>{' '}
              <span>
                {values.step_service_price.test_period_duration}{' '}
                {
                  values.step_service_price
                    .test_period_duration_unit_of_measurement
                }
              </span>
            </div>
            <div>
              <span className="font-bold">Test Period Price: </span>{' '}
              <span>{values.step_service_price.test_period_price}</span>
            </div>
            <div>
              <span className="font-bold">
                Max Number of Simultaneous Orders:{' '}
              </span>{' '}
              <span>
                {values.step_service_price.max_number_of_simultaneous_orders}
              </span>
            </div>
            <div>
              <span className="font-bold">Max Number of Monthly Orders: </span>{' '}
              <span>
                {values.step_service_price.max_number_of_monthly_orders}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type={'button'} variant={'outline'} onClick={prevStep}>
          Back
        </Button>
        <Button type={'submit'}>Create Account</Button>
      </div>
    </div>
  );
}

export default MultiStepFormDemo;
