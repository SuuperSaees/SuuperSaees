import { useRef, useState } from 'react';

import { CloudUpload } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface UploadImageProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'placeholder',
    value: string,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabase();

  const handleDivClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewFile(file);
      const uploadedImageFilepath = await uploadImage(file)
    }
  };

  async function uploadImage(file: File) {
    const newFilepath = 'uploads' + "/" + `${Date.now()}_${file.name}`
    const { data, error } = await supabase.storage
      .from("create_brief")
      .upload(newFilepath, file);
    if (error) console.log(error);
    return newFilepath;
  }

  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FormLabel>
                {t('creation.form.questionLabel')} {index + 1}
              </FormLabel>
            </div>

            <FormField
              control={form.control}
              name={`questions.${index}.placeholder`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div
                      onClick={handleDivClick}
                      className="flex flex-col items-center justify-center rounded-xl border-[1.5px] border-slate-200 py-4 hover:bg-slate-50"
                    >
                      <input
                        id="file-upload"
                        type="file"
                        className="sr-only"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                      />
                      <div className="mb-3 rounded-xl border-[1.5px] border-slate-200 p-2 drop-shadow-sm bg-slate-50">
                        <CloudUpload color="#667085" size={25} />
                      </div>
                      <input
                        {...field}
                        value={question.placeholder ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(
                            index,
                            'placeholder',
                            e.target.value,
                          )
                        }
                        style={{
                          width: `${Math.max(question.placeholder!.length, t('uploadImage.placeholder').length) + 1}ch`,
                          backgroundColor: '#00000000',
                        }}
                        placeholder={t('uploadImage.placeholder')}
                        className="mb-[0.30rem] border-none text-center text-sm font-normal text-gray-400 focus:outline-none"
                      />
                      <p className="border-none text-center text-sm font-normal text-gray-400 focus:outline-none">
                        {t('uploadImage.fileTypes')}
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <BriefsProvider.Options
            formFieldId={question.id}
            className="ml-auto"
          />
        </FormItem>
      )}
    />
  );
};

export default UploadImage;
