import { CloudUpload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField as FormFieldProvider,
  FormItem,
  FormMessage,
} from '@kit/ui/form';

import { ComponentProps } from '../../types/brief.types';
import FormField from './form-field';

const UploadFiles: React.FC<ComponentProps> = ({
  index,
  question,
  form,
  handleQuestionChange,
  handleQuestionFocus,
  handleQuestionBlur
}) => {
  const { t } = useTranslation('briefs');
  return (
    <FormField
      index={index}
      question={question}
      form={form}
      handleQuestionChange={handleQuestionChange}
      handleQuestionFocus={handleQuestionFocus}
      handleQuestionBlur={handleQuestionBlur}
    >
      <FormFieldProvider
        control={form.control}
        name={`questions.${index}.placeholder`}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormControl>
              <div className="flex flex-col items-center justify-center rounded-xl border-[1.5px] border-slate-200 py-4 bg-white">
                <div className="mb-3 rounded-xl border-[1.5px] border-slate-200 p-2 drop-shadow-sm">
                  <CloudUpload color="#667085" size={25} />
                </div>
                <input
                  {...field}
                  value={question.placeholder ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleQuestionChange(
                      question.id,
                      'placeholder',
                      e.target.value,
                    )
                  }
                  onFocus={() => handleQuestionFocus && handleQuestionFocus(question.id, 'placeholder')}
                  placeholder={t('uploadFiles.placeholder')}
                  className="mb-[0.30rem] w-full border-none bg-transparent text-center text-sm font-normal text-gray-400 focus:outline-none"
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
    </FormField>
  );
};

export default UploadFiles;
