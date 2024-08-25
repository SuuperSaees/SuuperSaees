'use client';

import React, { useState } from 'react';

import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { Label } from '@kit/ui/label';

interface UploadImageComponentProps {
  onImageUpload: (imageUrl: string) => void;
}

export default function UploadImageComponent({
  onImageUpload,
}: UploadImageComponentProps) {
  const { t } = useTranslation('services');
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>(
    'Debe seleccionar una imagen',
  );

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-input');
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
      const { data, error: uploadError } = await supabase.storage
        .from('services')
        .upload(filePath, file);

      if (data) {
        console.log('Imagen subida:', data);
      }

      if (uploadError) {
        throw new Error(`Error al subir la imagen: ${uploadError.message}`);
      }

      const { data: publicURL } = supabase.storage
        .from('services')
        .getPublicUrl(filePath);

      if (!publicURL) {
        throw new Error('Error al obtener la URL pública');
      }

      onImageUpload(publicURL.publicUrl);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      setError('Hubo un error al subir la imagen. Intenta nuevamente.');
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
        <Button onClick={handleButtonClick}>
          <Plus size={16} className="mr-2" />
          {t('upload_image')}
        </Button>
        <input
          type="file"
          accept="image/*"
          id="file-input"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </div>
      <span className="text-sm text-gray-500">{fileName}</span>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
