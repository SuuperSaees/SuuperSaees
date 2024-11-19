import { useRef, useState } from 'react';
import { Image as ImageLucide } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { generateUUID } from '../../../../../../apps/web/app/utils/generate-uuid';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../../../apps/web/lib/database.types';
import { useTranslation } from 'react-i18next';
// import Image from 'next/image';

interface UpdateImageProps{
  organizationId: string;
  mode: 'darkLogo' | 'lightLogo' | 'favicon' | 'profilePicture';
}

const settingToUpdate = {
  'lightLogo': 'logo_url',
  'darkLogo': 'logo_dark_url',
  'favicon': 'favicon_url',
  'profilePicture': 'profile_picture_url',
}

export default function UpdateImage({organizationId, mode}: UpdateImageProps) {
  const {logo_url, logo_dark_url, favicon_url, updateOrganizationSetting} = useOrganizationSettings();
  const [image, setImage] = useState(mode == 'lightLogo' ? logo_url : mode == 'darkLogo' ? logo_dark_url : favicon_url);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useSupabase();
  const {t} = useTranslation('account');


  const handleFileSelect = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      await handleDelete();
      const fileExtension = file.name.split('.').pop();
      const fileUuid = generateUUID();
      const fileName = `${organizationId}-${mode}-${fileUuid}.${fileExtension}`;
      const bucket = client.storage.from('organization');
      const result = await bucket.upload(fileName, file);

      if (!result.error) {
        const finalUrl = bucket.getPublicUrl(fileName).data.publicUrl;
        setImage(finalUrl);
        if (mode == 'lightLogo' || mode == 'darkLogo' || mode == 'favicon') {
          updateOrganizationSetting.mutate({
            key: settingToUpdate[mode],
            value: finalUrl,
          });
        }
      }
      throw result.error;
    }
  };

  const handleUpdate = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async() => {
    setImage('');
    if(image){
      await deleteImageFromBucket(client, image);
      updateOrganizationSetting.mutate({
        key: settingToUpdate[mode],
        value: '',
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  function deleteImageFromBucket(client: SupabaseClient<Database>, url: string){
    const bucket = client.storage.from('organization');
    const fileName = url.split('/').pop()?.split('?')[0];
    if (!fileName) {
      return;
    }
  
    return bucket.remove([fileName]);
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex justify-start">
        <label
          // htmlFor="file-input"
          onClick={handleUpdate}
          className="border-border hover:border-black relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border"
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded image"
              className={`h-full w-full object-contain ${mode == 'darkLogo' ? 'bg-black' : ''}`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-none">
              <ImageLucide className="text-primary-950 h-6 w-6" />
            </div>
          )}
        </label>
        <input
          id="file-input"
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
          aria-label="Upload profile picture"
        />
      </div>
      <div className="flex justify-end gap-4 text-sm">
        <Button
          variant="static"
          className="p-0 text-blue-600"
          onClick={handleUpdate}
        >
          {t('update')}
        </Button>
        <Button
          variant="static"
          className="p-0 text-gray-600"
          onClick={handleDelete}
        >
          {t('delete')}
        </Button>
      </div>
    </div>
  );
}
