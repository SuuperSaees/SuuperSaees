'use client';
 
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
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
import { Checkbox } from "@kit/ui/checkbox"
import React, { useState } from 'react';
import { Textarea } from '@kit/ui/textarea';
 
const FormSchema = createStepSchema({
    step_type_of_service: z.object({
        single_sale: z.boolean().default(false).optional(),
        recurring_subscription: z.boolean().default(false).optional(),
    }),
    step_service_details: z.object({
        service_image: z.string(),
        service_name: z.string(),
        service_description: z.string(),
    }),
});
 
type FormValues = z.infer<typeof FormSchema>;
 
export function MultiStepFormDemo() {
  const { t } = useTranslation('services');
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        step_type_of_service : {
            single_sale: true,
            recurring_subscription: false,
        },
        step_service_details: {
            service_image: '',
            service_name: '',
            service_description: '',
        }

    },
    reValidateMode: 'onBlur',
    mode: 'onBlur',
  });
 
  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log({ 'data': data
    })
  }
 
  return (
    <MultiStepForm
      className={'space-y-10 p-8 rounded-xl border'}
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
                t('step_connect_briefs')
              ]}
              currentStep={currentStepIndex}
            />
          )}
        </MultiStepFormContextProvider>
      </MultiStepFormHeader>
 
      <MultiStepFormStep name="step_type_of_service">
        <TypeOfServiceStep />
      </MultiStepFormStep>
 
      <MultiStepFormStep name="step_details">
        <DetailsStep />
        {/* <ReviewStep /> */}
      </MultiStepFormStep>
 
      <MultiStepFormStep name="review">
        <ReviewStep />
      </MultiStepFormStep>
    </MultiStepForm>
  );
}


function TypeOfServiceStep() {
    const { form, nextStep, isStepValid } = useMultiStepFormContext();
    const { t } = useTranslation('services');

    type CheckboxName = 'step_type_of_service.single_sale' | 'step_type_of_service.recurring_subscription';

    const handleCheckboxChange = (name: CheckboxName) => (checked: boolean) => {
        form.setValue('step_type_of_service.single_sale', false); 
        form.setValue('step_type_of_service.recurring_subscription', false); 
        form.setValue(name, checked);  
    };

    const getCheckboxClass = (isSelected: boolean) =>
        isSelected
          ? "flex flex-col w-[505.564px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[2.948px] border-brand-600 bg-white"
          : "flex flex-col w-[505.564px] p-[23.583px] items-start flex-shrink-0 rounded-[17.687px] border-[1.474px] border-gray-200 bg-white";


    return (
        <div className=''>
            <div className=' mb-[32px] text-brand-600 text-[16px] font-bold leading-[44px] tracking-[-0.32px] w-[343px] h-[20px]'>
                {t('step_type_of_service')}
            </div>
            <Form {...form}>
                <div className={'flex flex-col gap-4'}>
                    <div className='flex gap-4'>
                        <FormField
                            control={form.control}
                            name="step_type_of_service.single_sale"
                            render={({ field }) => (
                                <FormItem className={getCheckboxClass(field.value)}>
                                    <FormControl>
                                        <div className='flex gap-[11.792px]'>
                                            <div
                                                className={`w-8 h-8 border-2 flex items-center justify-center cursor-pointer ${
                                                    field.value ? 'flex w-[23.583px] h-[23.583px] p-[7.37px] justify-center items-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600' : 'w-[47.166px] h-[23.583px] rounded-[5.896px] border-[1.474px] border-gray-300'
                                                }`}
                                                onClick={() => handleCheckboxChange('step_type_of_service.single_sale')(!field.value)}
                                                >
                                                {field.value && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div>
                                                <FormLabel className="text-gray-700 font-inter text-[20.635px] font-medium leading-[29.479px]">
                                                    {t('single_sale')}
                                                </FormLabel>
                                                <div>
                                                    <FormDescription className='text-gray-600 font-inter text-[20.635px] font-normal leading-[29.479px]'>
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
                                        <div className='flex gap-[11.792px]'>
                                            <div
                                                className={`w-8 h-6 border-2 flex items-center justify-center cursor-pointer ${
                                                    field.value ? 'flex w-[23.583px] h-[23.583px] p-[7.37px] justify-center items-center rounded-[11.792px] border-[1.474px] border-brand-600 bg-brand-600' : 'w-[47.166px] h-[23.583px] rounded-[5.896px] border-[1.474px] border-gray-300'
                                                }`}
                                                onClick={() => handleCheckboxChange('step_type_of_service.recurring_subscription')(!field.value)}
                                                >
                                                {field.value && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                            <div>
                                                <FormLabel className="text-gray-700 font-inter text-[20.635px] font-medium leading-[29.479px]">
                                                    {t('recurring_subscription')}
                                                </FormLabel>
                                                <div>
                                                    <FormDescription className='text-gray-600 font-inter text-[20.635px] font-normal leading-[29.479px]'>
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
    const [selectedImage, setSelectedImage] = useState<string | ArrayBuffer | null>(null);
  
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result);
          form.setValue('step_service_details.service_image', file.name); // Optionally store the filename or URL
        };
        reader.readAsDataURL(file);
      }
    };
  
    return (
      <Form {...form}>
        <div className={'flex gap-[36px]'}>
          <div className="w-[390px] h-[190px] rounded-md bg-gray-300">
            {selectedImage && (
              <img
                src={selectedImage as string}
                alt="Selected"
                className="w-[390px] h-[190px] rounded-md bg-gray-300"
              />
            )}
          </div>
  
          <div className="w-1/2 p-[36px]">
            <FormField
              name="step_service_details.service_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-gray-700 text-xl font-bold leading-[20px]'>{t('service_image')}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        handleImageChange(event);
                        field.onChange(event);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
          <FormField
            name="step_service_details.service_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('service_name')}</FormLabel>
                <FormControl>
                  <Input {...field} className='w-full flex' />
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
                  {/* <Input {...field} className='w-full flex' /> */}
                  <Textarea {...field} className='w-full flex' />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

  
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="outline" onClick={prevStep}>
            Previous
          </Button>
  
          <Button onClick={nextStep}>Next</Button>
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
          <div className='flex flex-col'>
            <span>Single Sale</span> <span>{values.step_type_of_service.single_sale ? 'Sí' : 'No'}</span>
            <span>Recurring subscription</span> <span>{values.step_type_of_service.recurring_subscription ? 'Sí' : 'No'}</span>
            <span>Service Image</span> <span>{values.step_service_details.service_image}</span>
            <span>Service Name</span> <span>{values.step_service_details.service_name}</span>
            <span>Service Description</span> <span>{values.step_service_details.service_description}</span>
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