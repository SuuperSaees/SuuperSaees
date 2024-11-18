'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { Image as ImageIcon, X } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { Button } from '../shadcn/button';
import { ImageUploadInput } from './image-upload-input';
import { Trans } from './trans';

export function ImageUploader(
  props: React.PropsWithChildren<{
    value: string | null | undefined;
    onValueChange: (value: File | null) => unknown;
    floatingDeleteButton?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }>,
) {
  const [image, setImage] = useState(props.value);

  const { setValue, register } = useForm<{
    value: string | null | FileList;
  }>({
    defaultValues: {
      value: props.value,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const control = register('value');

  const onClear = useCallback(() => {
    props.onValueChange(null);
    setValue('value', null);
    setImage('');
  }, [props, setValue]);

  const onValueChange = useCallback(
    ({ image, file }: { image: string; file: File }) => {
      props.onValueChange(file);

      setImage(image);
    },
    [props],
  );

  const Input = () => (
    <ImageUploadInput
      {...control}
      accept={'image/*'}
      className={'absolute h-full w-full'}
      visible={false}
      multiple={false}
      onValueChange={onValueChange}
    />
  );

  useEffect(() => {
    setImage(props.value);
  }, [props.value]);

  if (!image) {
    return (
      <FallbackImage
        descriptionSection={props.children}
        className={props.className}
      >
        <Input />
      </FallbackImage>
    );
  }

  return (
    <div className='relative flex items-center space-x-4 w-fit'>
      <label
        className={`relative animate-in fade-in zoom-in-50 ${props.className}` }
        style={props.style}
      >
        <Image
          fill
          className={'h-full w-full rounded-full object-contain'}
          src={image}
          alt={''}
        />

        <Input />
      </label>

      <div>
        {props.floatingDeleteButton ? (
          <Button
            onClick={onClear}
            size={'sm'}
            variant={'ghost'}
            className="absolute right-0 top-0 h-5 w-5 rounded-full bg-transparent p-1 text-primary hover:bg-primary/10 hover:text-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={onClear}
            size={'sm'}
            variant={'ghost'}
          
          >
            <Trans i18nKey={'common:clear'} />
          </Button>
        )}
      </div>
    </div>
  );
}

function FallbackImage(
  props: React.PropsWithChildren<{
    descriptionSection?: React.ReactNode;
    className?: string;
  }>,
) {
  return (
    <div className={'flex items-center space-x-4'}>
      <label
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-full border border-border animate-in fade-in zoom-in-50 hover:border-primary ${props.className}`}
      >
        <ImageIcon className={'h-8 text-primary'} />

        {props.children}
      </label>

      {props.descriptionSection}
    </div>
  );
}
