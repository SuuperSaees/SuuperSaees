'use client';

import { useCallback } from 'react';



import type { SupabaseClient } from '@supabase/supabase-js';



import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';



import { Database } from '@kit/supabase/database';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { ImageUploader } from '@kit/ui/image-uploader';
import { Trans } from '@kit/ui/trans';



import { useOrganizationSettings } from '../../context/organization-settings-context';


const ORGANIZATION_BUCKET = 'organization';

export default function UpdateAccountOrganizationDarkLogo(props: {
  organizationId: string;
  className?: string;
}) {
  const { logo_dark_url, updateOrganizationSetting, sidebar_background_color } = useOrganizationSettings();
  const client = useSupabase();
  const { t } = useTranslation('account');
  const createToaster = useCallback(
    (promise: () => Promise<unknown>) => {
      return toast.promise(promise, {
        success: t(`updateProfileSuccess`),
        error: t(`updateProfileError`),
        loading: t(`updateProfileLoading`),
      });
    },
    [t],
  );

  const onValueChange = useCallback(
    (file: File | null) => {
      const removeExistingStorageFile = () => {
        if (logo_dark_url) {
          return deleteLogoImage(client, logo_dark_url) ?? Promise.resolve();
        }
        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile()
            .then(() => {
              return uploadOrganizationLogo(client, file, props.organizationId);
            })
            .then(
              (value) => {
                updateOrganizationSetting.mutate({
                  key: 'logo_dark_url',
                  value,
                });
              },
            )
            .catch((error) => {
              console.error('[Dark Logo Upload] Error during upload process', error);
              throw error;
            });

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile().then(() => {
            return updateOrganizationSetting.mutate({
              key: 'logo_dark_url',
              value: '',
            });
          });
        // .then(() => {
        //   props.onLogoUpdated();
        // });

        createToaster(promise);
      }
    },
    [client, createToaster, logo_dark_url, props, updateOrganizationSetting],
  );
  return (
    <ImageUploader value={logo_dark_url} onValueChange={onValueChange} className={props.className}
    style={{
      backgroundColor: sidebar_background_color ?? 'black',
    }}
    >
      <div className={'flex flex-col space-y-1'}>
        <span className={'text-sm'}>
          <Trans i18nKey={'account:brandLogoSelectLabel'} />
        </span>

        {/* <span className={'text-xs'}>
          <Trans i18nKey={'account:profilePictureSubheading'} />
        </span> */}
      </div>
    </ImageUploader>
  );
}

function deleteLogoImage(client: SupabaseClient<Database>, url: string) {
  const bucket = client.storage.from(ORGANIZATION_BUCKET);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  return bucket.remove([fileName]);
}

async function uploadOrganizationLogo(
  client: SupabaseClient<Database>,
  photoFile: File,
  organizationId: string,
) {
  try {
    const bytes = await photoFile.arrayBuffer();
    const bucket = client.storage.from(ORGANIZATION_BUCKET);
    const extension = photoFile.name.split('.').pop();
    const fileName = await getAvatarFileName(organizationId, extension);
  
    const result = await bucket.upload(fileName, bytes);
  
    if (!result.error) {
      const publicUrl = bucket.getPublicUrl(fileName).data.publicUrl;
      return publicUrl;
      // return bucket.getPublicUrl(fileName).data.publicUrl;
    }
    console.error('[Dark Logo Upload] Upload failed', result.error);
    throw result.error;
  } catch (error) {
    console.error('[Dark Logo Upload] Unexpected error during upload', error);
    throw error;
  }
}

async function getAvatarFileName(
  organizationId: string,
  extension: string | undefined,
) {
  const { nanoid } = await import('nanoid');

  // we add a version to the URL to ensure
  // the browser always fetches the latest image
  const uniqueId = nanoid(16);

  return `${organizationId}.dark.${extension}?v=${uniqueId}`;
}