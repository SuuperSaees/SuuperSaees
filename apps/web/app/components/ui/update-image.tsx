import { useRef, useState } from 'react';

import { SupabaseClient } from '@supabase/supabase-js';

import { Image as ImageLucide, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';

import { Database } from '~/lib/database.types';
import { generateUUID } from '~/utils/generate-uuid';
import { toast } from 'sonner';

export type ImageFloatingButtons = {
  update: boolean;
  delete: boolean;
};

export type ImageStorage = {
  id: string;
  name: string;
  identifier: string;
};

interface UpdateImageProps {
  defaultImageURL: string;
  bucketStorage: ImageStorage;
  onUpdate?: (url: string) => Promise<void>;
  floatingButtons?: ImageFloatingButtons;
  className?: string;
  [key: string]: unknown;
}

export default function UpdateImage({
  bucketStorage,
  defaultImageURL,
  onUpdate,
  floatingButtons,
  className,
  ...rest
}: UpdateImageProps) {
  const [image, setImage] = useState(defaultImageURL);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const client = useSupabase();
  const { t } = useTranslation('account');

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
      if (bucketStorage.identifier.includes('favicon')) {
        const host = window.location.host;
        fileName = `${host}_favicon_url?v=${fileUuid}`;
      } else {
        if (bucketStorage.identifier && bucketStorage.name !== 'account_image') { // restriction of account_image due to policy in the supabase storage
          fileName = `${bucketStorage.id}.${bucketStorage.identifier}.${fileExtension}?v=${fileUuid}`;
          // fileName = `${bucketStorage.id}.${fileExtension}?v=${fileUuid}`;
        } else {
          fileName = `${bucketStorage.id}.${fileExtension}?v=${fileUuid}`;
        }
      }
      
      const bucket = client.storage.from(bucketStorage.name);
      const result = await bucket.upload(fileName, bytes, {
        upsert: true,
      });

      if (!result.error) {
        const finalUrl = bucket.getPublicUrl(fileName).data.publicUrl;
        setImage(finalUrl);

        if (onUpdate) await onUpdate(finalUrl);
      } else {
        toast.error('Error', {
          description: t('account:updateProfileError'),
        });
        throw result.error;
      }
    }
  };

  
  const handleDelete = async () => {
    setImage('');
    if (image) {
      try {
        await deleteImageFromBucket(client, image);
        onUpdate && (await onUpdate(''));
      } catch (error) {
        console.error(`Error deleting image from bucket:`, error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleUpdate = () => {
    fileInputRef.current?.click();
  };

  function deleteImageFromBucket(
    client: SupabaseClient<Database>,
    url: string,
  ) {
    const bucket = client.storage.from(
      `${bucketStorage.name}.${bucketStorage.identifier}`,
    );
    const fileName = url.split('/').pop()?.split('?')[0];
    if (!fileName) {
      return;
    }

    return bucket.remove([fileName]);
  }

  return (
    <div className="group relative flex items-center justify-between">
      <div className="flex justify-start">
        <label
          // htmlFor="file-input"
          onClick={handleUpdate}
          className={`relative cursor-pointer overflow-hidden rounded-full border border-border hover:border-black ${className}`}
          {...rest}
        >
          {image ? (
            <img
              src={image}
              alt="Upload image"
              className={`h-full w-full object-contain`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-none">
              <ImageLucide className="h-6 w-6 text-primary-950" />
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

      {!floatingButtons ? (
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
      ) : (
        <>
          {floatingButtons.delete && (
            <Button
              onClick={handleDelete}
              size={'sm'}
              variant={'ghost'}
              className="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-transparent p-1 text-primary hover:bg-primary/10 hover:text-primary group-hover:flex"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
