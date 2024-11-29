import Image from 'next/image';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem} from '@kit/ui/form';
import { BriefsProvider } from '../contexts/briefs-context';
import { FormField as FormFieldType } from '../types/brief.types';
import { BriefCreationForm } from './brief-creation-form';

export interface UploadImageProps {
  index: number;
  question: FormFieldType;
  form: UseFormReturn<BriefCreationForm>;
}

const UploadImagePreview: React.FC<UploadImageProps> = ({
  index,
  question,
  form,
}) => {
  const imageUrl = question.label.toLowerCase() !== 'image'
      ? question.label
      : '';

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
