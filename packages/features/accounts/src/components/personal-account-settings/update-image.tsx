import { useRef, useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Image as ImageLucide } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import { generateUUID } from '../../../../../../apps/web/app/utils/generate-uuid';
import { Database } from '../../../../../../apps/web/lib/database.types';
import { updateUserSettings } from '../../../../team-accounts/src/server/actions/members/update/update-account';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import { useRevalidatePersonalAccountDataQuery } from '../../hooks/use-personal-account-data';

interface UpdateImageProps {
  organizationId?: string;
  mode: 'darkLogo' | 'lightLogo' | 'favicon' | 'profilePicture';
  user?: { pictureUrl: string | null; id: string };
}

const settingToUpdate = {
  lightLogo: 'logo_url',
  darkLogo: 'logo_dark_url',
  favicon: 'favicon_url',
  profilePicture: 'profile_picture_url',
};

const bucketChoice = {
  profilePicture: 'account_image',
  lightLogo: 'organization',
  darkLogo: 'organization',
  favicon: 'organization',
};

export default function UpdateImage({
  organizationId,
  mode,
  user,
}: UpdateImageProps) {
  const { logo_url, logo_dark_url, favicon_url, updateOrganizationSetting, sidebar_background_color } =
    useOrganizationSettings();
  const [image, setImage] = useState(
    mode == 'lightLogo'
      ? logo_url
      : mode == 'darkLogo'
        ? logo_dark_url
        : mode == 'favicon'
          ? favicon_url
          : mode == 'profilePicture'
            ? user?.pictureUrl
            : '',
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useSupabase();
  const { t } = useTranslation('account');

  const revalidateAccount = useRevalidatePersonalAccountDataQuery();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      await handleDelete();
      const bytes = await file.arrayBuffer();
      const fileExtension = file.name.split('.').pop();
      const fileUuid = generateUUID();

      let fileName = '';
      if (mode == 'favicon') {
        const host = window.location.host;
        fileName = `${host}_favicon_url?v=${fileUuid}`;
      } else {
        if (mode == 'lightLogo' || mode == 'darkLogo') {
          fileName = `${organizationId}.${mode}.${fileExtension}?v=${fileUuid}`;
        } else {
          fileName = `${user?.id}.${fileExtension}?v=${fileUuid}`;
        }
      }

      const bucket = client.storage.from(bucketChoice[mode]);
      const result = await bucket.upload(fileName, bytes);

      if (!result.error) {
        const finalUrl = bucket.getPublicUrl(fileName).data.publicUrl;
        setImage(finalUrl);

        if (mode == 'lightLogo' || mode == 'darkLogo' || mode == 'favicon') {
          updateOrganizationSetting.mutate({
            key: settingToUpdate[mode],
            value: finalUrl,
          });
        } else {
          try {
            await updateUserSettings(user?.id ?? '', { picture_url: finalUrl });
            toast.success(t('updateSuccess'), {
              description: t('updateProfileSuccess'),
            });
            await revalidateAccount(user?.id ?? '')
          } catch (error) {
            toast.error('Error', {
              description: t('updateProfileError'),
            });
            console.error(error);
          }
        }
      } else {
        throw result.error;
      }
    }
  };

  const handleUpdate = () => {
    fileInputRef.current?.click();
  };

  const handleDelete = async () => {
    setImage('');
    if (image) {
      await deleteImageFromBucket(client, image);
      if (mode == 'lightLogo' || mode == 'darkLogo' || mode == 'favicon') {
        updateOrganizationSetting.mutate({
          key: settingToUpdate[mode],
          value: '',
        });
      } else {
        try {
          await updateUserSettings(user?.id ?? '', { picture_url: '' });
          toast.success(t('updateSuccess'), {
            description: t('updateProfileSuccess'),
          });
        } catch (error) {
          toast.error('Error', {
            description: t('updateProfileError'),
          });
          console.error(error);
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };



  function deleteImageFromBucket(
    client: SupabaseClient<Database>,
    url: string,
  ) {
    const bucket = client.storage.from(bucketChoice[mode]);
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
          className="border-border relative h-20 w-20 cursor-pointer overflow-hidden rounded-full border hover:border-black"
        >
          {image ? (
            <img
              style={{ backgroundColor: mode == 'darkLogo' ? sidebar_background_color ?? 'black' : '' }}
              src={image}
              alt="Uploaded image"
              className={`h-full w-full object-contain`}
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
