import { CloudUpload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { FormControl, FormField, FormItem, FormMessage } from '@kit/ui/form';

import { BriefsProvider } from '../../contexts/briefs-context';
import { ComponentProps } from '../../types/brief.types';

const UploadFiles: React.FC<ComponentProps> = ({
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
        <FormItem className="flex w-full flex-col gap-2 space-y-4 group relative">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between"></div>

            <FormField
              control={form.control}
              name={`questions.${index}.label`}
          
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <input
                      readOnly
                      {...field}
                      value={question.label}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(question.id, 'label', e.target.value)
                      }
                      style={{
                        width: `${Math.max(question.label.length, t('uploadFiles.title').length) + 1}ch`,
                      }}
                      placeholder={t('uploadFiles.title')}
                      className="bg-transparent border-none text-sm font-bold text-gray-700 font-bold focus:outline-none"
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
                    readOnly
                      {...field}
                      value={question.description ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleQuestionChange(
                          question.id,
                          'description',
                          e.target.value,
                        )
                      }

                      placeholder={t('uploadFiles.description')}
                      className="bg-transparent w-full border-none text-sm font-medium text-gray-500 focus:outline-none"
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
                        readOnly
                        {...field}
                        value={question.placeholder ?? ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleQuestionChange(
                            question.id,
                            'placeholder',
                            e.target.value,
                          )
                        }
                        placeholder={t('uploadFiles.placeholder')}
                        className="bg-transparent mb-[0.30rem] w-full border-none text-center text-sm font-normal text-gray-400 focus:outline-none"
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
            className="ml-auto group-hover:flex hidden absolute right-0 top-0"
          />
        </FormItem>
      )}
    />
  );
};

export default UploadFiles;
