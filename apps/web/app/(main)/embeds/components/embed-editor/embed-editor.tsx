'use client';

import { useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ThemedButton } from 'node_modules/@kit/accounts/src/components/ui/button-themed-with-settings';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Form, FormMessage } from '@kit/ui/form';

import { Embeds } from '~/lib/embeds.types';

import { FormValues, formSchema } from '../../schema';
import { LocationField } from './fields/location-field';
import { OrganizationsField } from './fields/organizations-field';
import { TitleField } from './fields/title-field';
import { TypeField } from './fields/type-field';
import { ValueField } from './fields/value-field';
import { VisibilityField } from './fields/visibility-field';

interface EmbedEditorProps {
  onAction: (values: FormValues) => void | Promise<void>;
  onValueChange?: (value: string) => void;
  defaultValue:
    | (Embeds.Type & {
        embed_accounts: string[];
      })
    | null;
  availableEmbeds?: (Embeds.Type & {
    embed_accounts: string[];
  })[];
  showEmbedSelector?: boolean;
  type: 'create' | 'update';
}

export function EmbedEditor({
  onAction,
  onValueChange,
  defaultValue,
  type,
  // availableEmbeds = [],
  // showEmbedSelector = false
}: EmbedEditorProps) {
  const { t } = useTranslation('embeds');
  // Track if form has been initialized from defaultValue
  const initializedRef = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValue?.title ?? '',
      icon: defaultValue?.icon ?? '',
      location: defaultValue?.location ?? 'tab',
      type: defaultValue?.type ?? 'url',
      visibility: defaultValue?.visibility ?? 'public',
      value: defaultValue?.value ?? '',
      embed_accounts: defaultValue?.embed_accounts ?? [],
    },
  });

  // Effect to handle defaultValue changes
  useEffect(() => {
    // Only reset the form with defaultValue on mount or if defaultValue changes significantly
    // This prevents re-initializing the form when editing and maintains user edits
    if (!defaultValue) return;
    
    if (!initializedRef.current) {
      form.reset({
        title: defaultValue.title ?? '',
        icon: defaultValue.icon ?? '',
        location: defaultValue.location ?? 'tab',
        type: defaultValue.type ?? 'url',
        visibility: defaultValue.visibility ?? 'public',
        value: defaultValue.value ?? '',
        embed_accounts: defaultValue.embed_accounts ?? [],
      });
      initializedRef.current = true;
    }
  }, [defaultValue, form]);

  // Watch value field for real-time preview
  const value = form.watch('value');
  useEffect(() => {
    onValueChange?.(value);
  }, [value, onValueChange]);

  const handleSubmit = async (values: FormValues) => {
    await onAction(values);
  };

  // Handle selection from the embed selector
  // const handleEmbedSelect = (embed: Embeds.Type & { embed_accounts: string[] }) => {
  //   form.reset({
  //     title: embed.title ?? '',
  //     icon: embed.icon ?? '',
  //     location: embed.location ?? 'tab',
  //     type: embed.type ?? 'url',
  //     visibility: embed.visibility ?? 'public',
  //     value: embed.value ?? '',
  //     embed_accounts: embed.embed_accounts ?? [],
  //   });
  // };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="ml-auto flex h-full max-w-80 flex-col gap-4 text-gray-500 py-2"
      >
        <h2 className="font-bold text-gray-600">{t('form.title')}</h2>
        <p className="text-sm text-gray-500">{t('form.description')}</p>

        {/* Embed selector for pre-filling form values */}
        {/* <EmbedSelector 
          embeds={availableEmbeds} 
          onSelect={handleEmbedSelect} 
          showSelector={showEmbedSelector} 
        /> */}
        <div className="scrollbar-on-hover flex flex-col gap-4 overflow-y-auto shrink">
          <TitleField control={form.control} />
          <LocationField control={form.control} />
          <TypeField control={form.control} />
          <ValueField control={form.control} watch={form.watch} />
          <VisibilityField control={form.control} />

          {form.watch('visibility') === 'private' && (
            <OrganizationsField
              control={form.control}
              setValue={form.setValue}
              defaultValues={form.formState.defaultValues?.embed_accounts?.filter(
                (account): account is string => account !== undefined,
              )}
            />
          )}
          <FormMessage />
        </div>

        <ThemedButton type="submit" className="mt-auto w-full shrink-0">
          {type === 'create' ? t('form.createButton') : t('form.updateButton')}
        </ThemedButton>
      </form>
    </Form>
  );
}
