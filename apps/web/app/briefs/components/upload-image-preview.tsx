import { useEffect, useRef, useState } from 'react';

import Image from 'next/image';

import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Button } from '@kit/ui/button';
import { FormField, FormItem, FormLabel } from '@kit/ui/form';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface UploadImageProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'placeholder',
    value: string,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const UploadImagePreview: React.FC<UploadImageProps> = ({
  index,
  question,
  form,
}) => {
  const { t } = useTranslation('briefs');
  // const [newFile, setNewFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(() => {
    const initialValue = form.getValues(`questions.${index}.label`);
    return initialValue && initialValue.toLowerCase() !== 'image'
      ? initialValue
      : null;
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initialValue = form.getValues(`questions.${index}.label`);
    setImageUrl(
      initialValue && initialValue.toLowerCase() !== 'image'
        ? initialValue
        : null,
    );
  }, [form.getValues(`questions.${index}.label`)]);

  const handleRemoveImage = () => {
    setImageUrl(null);
    setSelectedFileName('');
    form.setValue(`questions.${index}.label`, '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    return url.toLowerCase() !== 'image';
  };

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel>
              {t('creation.form.questionLabel')} {index + 1}
            </FormLabel>
          </div>
          {isValidImageUrl(imageUrl) ? (
            <Image
              alt="Image"
              src={imageUrl ?? ''}
              width={0}
              height={0}
              className="rounded-xl"
              sizes="100vw"
              style={{ width: '100%', height: 'auto' }}
            />
          ) : (
            <div className="flex h-80 w-full items-center justify-center rounded-xl bg-gradient-to-tr from-amber-300 to-pink-300"></div>
          )}

          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto"
          />
        </FormItem>
      )}
    />
  );
};

export default UploadImagePreview;
