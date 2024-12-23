'use client';

import React, { useState } from 'react';



import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';

import { ThemedButton } from '../../../../../../accounts/src/components/ui/button-themed-with-settings';

interface UploadImageComponentProps {
  onImageUpload: (imageUrl: string, filePath: string) => void;
  fileName: string;
  setFileName: (fileName: string) => void;
}

export default function UploadImageComponent({
  onImageUpload,
  fileName,
  setFileName,
}: UploadImageComponentProps) {
  const { t } = useTranslation('services');
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);


  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const fileInput = document.getElementById('file-input-services');
    if (fileInput) {
      fileInput.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError('Debes seleccionar una imagen');
      return;
    }

    setFileName(file.name);
    setError(null);

    try {
      const filePath = `images/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage // data never used
        .from('services')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Error to upload image: ${uploadError.message}`);
      }

      const { data: publicURL } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      if (!publicURL) {
        throw new Error('Error to get public URL');
      }
      onImageUpload(publicURL.publicUrl, filePath);

    } catch (error) {
      console.error('Error to upload image:', error);
      setError('There was an error uploading the image. Try again.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-[20px] font-bold font-normal leading-[20px] text-gray-700">
        {t('service_image')}
      </Label>
      <Label className="text-[14px] font-medium leading-[20px] text-gray-700">
        {t('service_image_recommendation')}
      </Label>
      <div>
        <ThemedButton onClick={handleButtonClick}>
          <Plus size={16} className="mr-2" />
          {t('upload_image')}
        </ThemedButton>
        <Input
          type="file"
          accept="image/*"
          id="file-input-services"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
      <span
        className={`text-sm ${fileName === 'Debe seleccionar una imagen' ? 'text-red-500' : 'text-gray-500'}`}
      >
        {fileName}
      </span>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}