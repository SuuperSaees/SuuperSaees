import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';

import { BriefCreationForm } from './brief-creation-form';

interface FieldsetInformationProps {
  form: UseFormReturn<BriefCreationForm>;
}
export default function FieldsetInformation({
  form,
}: FieldsetInformationProps) {
  const { t } = useTranslation('briefs');
  return (
    <fieldset>
      <FormField
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{t('creation.form.titleLabel')}</FormLabel>
            <FormControl>
              <ThemedInput
                {...field}
                placeholder={t('creation.form.titlePlaceholder')}
                className="focus-visible:ring-none"
              />
            </FormControl>
            <FormMessage>{fieldState.error?.message}</FormMessage>
          </FormItem>
        )}
      />
    </fieldset>
  );
}
