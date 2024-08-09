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
import { BellIcon } from 'lucide-react';
import UploadImageComponent from '../../../../../../packages/features/team-accounts/src/server/actions/services/create/upload-image';
import CreditBasedRecurringSubscription from './recurring_subscription/credit_based';
import StandardRecurringSubscription from './recurring_subscription/standard';
import TimeBasedRecurringSubscription from './recurring_subscription/time_based';
import CreditBased from './single_sale/credit_based';
import Standard from './single_sale/standard';
import TimeBased from './single_sale/time_based';
// import BriefConnectionStep from './step-brief-connection';
import Link from 'next/link';
import { createService } from 'node_modules/@kit/team-accounts/src/server/actions/services/create/create-service-server';

export const FormSchema = createStepSchema({
  step_type_of_service: z.object({
    single_sale: z.boolean().default(false),
    recurring_subscription: z.boolean().default(false),
  }),
  step_service_details: z.object({
    service_image: z.string(),
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
  // step_connect_briefs: z.array(
  //   z.object({
  //     id: z.string(),
  //     name: z.string(),
  //   })),
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
              <div className='flex justify-between items-center mb-[32px]'>
                <h2 className={'text-gray-900 font-inter text-[30px] font-semibold leading-8'}>
                  {currentStepIndex === 0
                    ? t('step_type_of_service_title')
                    : currentStepIndex === 1
                    ? t('step_service_details')
                    : currentStepIndex === 2
                    ? t('step_service_price')
                    : t('step_connect_briefs')}
                </h2>
                <div className="flex space-x-4">
                    <span>
                        <Button variant="outline">
                            Tu prueba gratuita termina en xx dias
                        </Button>
                    </span>
                    <span>
                        <Button variant="outline" size="icon">
                            <BellIcon className="h-4 w-4" />
                        </Button>
                    </span>
                </div>
              </div>
              <Stepper
                variant={'customDots'}
                steps={[
                  t('step_type_of_service'),
                  t('step_service_details'),
                  t('step_service_price'),
                  // t('step_connect_briefs'),
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

      {/* <MultiStepFormStep name="connect_briefs">
        <BriefConnectionStep  />
      </MultiStepFormStep> */}
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
          <div className="flex items-center gap-[47.17px] justify-center">
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
          <div className="mt-4 flex justify-between space-x-2">
            <Link
              type="button"
              href={'/services'}
              className="border border-gray-300 inline-flex items-center justify-center whitespace-nowrap rounded-md bg-white text-sm font-medium text-gray-700 shadow transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
              px-4"
            >
              {t('previous')}
            </Link>
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
  // const { form, nextStep, prevStep } = useMultiStepFormContext();
  const { form, prevStep } = useMultiStepFormContext();

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

  async function createServiceFunction() {
    await createService({
      ...form.getValues(),
    });
    // window.location.reload();
  }

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
        <Button type="button" variant="outline" onClick={prevStep}>
          {t('previous')}
        </Button>

        {/* <Button onClick={nextStep}>{t('next')}</Button> */}
        {/* <Button type='submit' >{t('createService')}</Button> */}
        <Link
          // type="button"
          onClick={createServiceFunction}
          href={'/services'}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
        >
          {t('createService')}
        </Link>
      </div>
    </Form>
  );
}

export default MultiStepFormDemo;
