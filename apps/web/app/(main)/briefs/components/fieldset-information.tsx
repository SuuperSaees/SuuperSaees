'use client';

import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { ThemedTextarea } from 'node_modules/@kit/accounts/src/components/ui/textarea-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { useBriefsContext } from '../contexts/briefs-context';
import { BriefCreationForm } from './brief-creation-form';
import UploadImage from './upload-image-dropzone';

interface FieldsetInformationProps {
  form: UseFormReturn<BriefCreationForm>;
}
export default function FieldsetInformation({
  form,
}: FieldsetInformationProps) {
  const { t } = useTranslation('briefs');
  const { brief, updateBrief } = useBriefsContext();

  const handleBriefChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateBrief({ ...brief, [name]: value });
  };

  return (
    <fieldset className="flex flex-col gap-4">
      {/* Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="font-semibold text-gray-600">
              {t('creation.form.titleLabel')}
            </FormLabel>
            <FormControl>
              <ThemedInput
                {...field}
                placeholder={t('creation.form.titlePlaceholder')}
                className="focus-visible:ring-none text-gray-500"
                onChange={handleBriefChange}
                value={brief.name}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="font-semibold text-gray-600">
              {t('creation.form.descriptionLabel')}
            </FormLabel>
            <FormControl>
              {/* <RichTextEditor
                {...field}
                content={brief.description ?? ''}
                onChange={(text: string) => {
                  field.onChange();
                  updateBrief({ ...brief, description: text });
                }}
                userRole=""
                onComplete={() => void null}
                hideSubmitButton
              /> */}
              <ThemedTextarea
                {...field}
                placeholder={t('creation.form.titlePlaceholder')}
                className="focus-visible:ring-none text-gray-500"
                onChange={handleBriefChange}
                value={brief.description}
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />

      {/* Image */}
      <UploadImage
        index={0}
        nameField={'image_url'}
        form={form}
        handleQuestionChange={(imgUrl: string) => {
          // handleBriefChange
          updateBrief({ ...brief, image_url: imgUrl });
        }}
        defaultValue={brief.image_url}
        handleRemove={() => updateBrief({ ...brief, image_url: '' })}
      />
    </fieldset>
  );
}
