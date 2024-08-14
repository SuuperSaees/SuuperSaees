"use client";

import React, { useState } from 'react';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Label } from '@kit/ui/label';
import { Progress } from '../../../../packages/ui/src/shadcn/progress';

export default function UploadFileComponent() {
  const { t } = useTranslation('orders');
  const supabase = useSupabase();
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]); // Array para el progreso de múltiples archivos

  const handleButtonClick = () => {
    const fileInput = document.getElementById('file-input');
    if (fileInput) {
      fileInput.click(); 
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      setError('Debes seleccionar al menos un archivo');
      return;
    }

    setFiles(selectedFiles); // Almacena los archivos seleccionados
    setError(null); 
    setUploadProgress(new Array(selectedFiles.length).fill(0)); // Inicializa el progreso de subida

    try {
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          
          if (!file) continue;
  
          const filePath = `uploads/${Date.now()}_${file.name}`;
          
          // Utilizando XMLHttpRequest para manejar el progreso de subida
          const xhr = new XMLHttpRequest();
          xhr.open('POST', supabase.storage.from('orders').getUploadUrl(filePath), true);
          xhr.setRequestHeader('Authorization', `Bearer ${supabase.auth.session()?.access_token}`);
  
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress((prevProgress) => {
                const newProgress = [...prevProgress];
                newProgress[i] = progress;
                return newProgress;
              });
            }
          };
  
          xhr.onload = () => {
            if (xhr.status === 200) {
              console.log(`Archivo ${file.name} subido con éxito`);
            } else {
              setError(`Error al subir el archivo ${file.name}: ${xhr.statusText}`);
            }
          };
  
          xhr.onerror = () => {
            setError(`Error al subir el archivo ${file.name}`);
          };
  
          const formData = new FormData();
          formData.append('file', file);
          xhr.send(formData);
        }
  
      } catch (error) {
        console.error('Error al subir los archivos:', error);
        setError('Hubo un error al subir los archivos. Intenta nuevamente.');
      }
  };

  return (
    <div className='flex flex-col gap-2'>
      <Label className="text-gray-700 text-[20px] font-normal font-bold leading-[20px]">{t('service_files')}</Label>
      <Label className='text-gray-700 text-[14px] font-medium leading-[20px]'>{t('service_files_recommendation')}</Label>
      <div>
        <Button onClick={handleButtonClick}>
          <Plus size={16} className='mr-2'/>
          {t('upload_files')}
        </Button>
        <input
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          id="file-input"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple // Permitir selección de múltiples archivos
        />
      </div>

      {files.map((file, index) => (
        <div key={index} className="flex flex-col gap-1 mt-2">
          <span className="text-sm text-gray-500">{file.name}</span>
          {uploadProgress[index]! > 0 && <Progress value={uploadProgress[index]} />}
        </div>
      ))}

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
