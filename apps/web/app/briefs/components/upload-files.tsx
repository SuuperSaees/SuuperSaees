import { CloudUpload } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface UploadFilesProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
  handleQuestionChange: (
    index: number,
    field: 'label' | 'description' | 'placeholder',
    value: string,
  ) => void;
  handleRemoveQuestion: (index: number) => void;
}

const UploadFiles: React.FC<UploadFilesProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
}) => {
  const { t } = useTranslation('briefs');
  return (
    <FormField
      control={form.control}
      name={`questions.${index}`}
      render={() => (
        <FormItem className="flex w-full flex-col gap-2 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between"></div>

            <FormField
              control={form.control}
              name={`questions.${index}.label`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(index, 'label', e.target.value)
                      }
                      style={{
                        width: `${Math.max(question.label.length, t('uploadFiles.title').length) + 1}ch`,
                      }}
                      placeholder={t('uploadFiles.title')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`questions.${index}.description`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          index,
                          'description',
                          e.target.value,
                        )
                      }
                      style={{
                        width: `${Math.max(question.description!.length, t('uploadFiles.description').length) + 1}ch`,
                      }}
                      placeholder={t('uploadFiles.description')}
                      className="border-none text-sm font-medium text-gray-600 focus:outline-none"
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`questions.${index}.placeholder`}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex flex-col items-center justify-center rounded-xl border-[1.5px] border-slate-200 py-4">
                      <div className="mb-3 rounded-xl border-[1.5px] border-slate-200 p-2 drop-shadow-sm">
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
                          width: `${Math.max(question.placeholder!.length, t('uploadFiles.placeholder').length) + 1}ch`,
                        }}
                        placeholder={t('uploadFiles.placeholder')}
                        className="mb-[0.30rem] border-none text-center text-sm font-normal text-gray-400 focus:outline-none"
                      />
                      <p className="border-none text-center text-sm font-normal text-gray-400 focus:outline-none">
                        {t('uploadFiles.fileTypes')}
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

export default UploadFiles;
