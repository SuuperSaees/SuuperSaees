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

export default function UpdateAccountOrganizationFavicon(props: {
  organizationId: string;
}) {
  const { favicon_url, updateOrganizationSetting } = useOrganizationSettings();
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
        if (favicon_url) {
          return deleteFaviconImage(client, favicon_url) ?? Promise.resolve();
        }

        return Promise.resolve();
      };

      if (file) {
        const promise = () =>
          removeExistingStorageFile().then(
            () =>
              uploadOrganizationFavicon(client, file).then(
                (value) => {
                  updateOrganizationSetting.mutate({
                    key: 'favicon_url',
                    value,
                  });
                },
              ),
            // .then(() => {
            //   props.onLogoUpdated();
            // }),
          );

        createToaster(promise);
      } else {
        const promise = () =>
          removeExistingStorageFile().then(() => {
            return updateOrganizationSetting.mutate({
              key: 'favicon_url',
              value: '',
            });
          });
        // .then(() => {
        //   props.onLogoUpdated();
        // });

        createToaster(promise);
      }
    },
    [client, createToaster, favicon_url, props, updateOrganizationSetting],
  );
  // console.log('favicon_url', favicon_url);
  return (
    <ImageUploader value={favicon_url} onValueChange={onValueChange}>
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

function deleteFaviconImage(client: SupabaseClient<Database>, url: string) {
  const bucket = client.storage.from(ORGANIZATION_BUCKET);
  const fileName = url.split('/').pop()?.split('?')[0];

  if (!fileName) {
    return;
  }

  return bucket.remove([fileName]);
}

async function uploadOrganizationFavicon(
  client: SupabaseClient<Database>,
  photoFile: File,
) {
  const bytes = await photoFile.arrayBuffer();
  const bucket = client.storage.from(ORGANIZATION_BUCKET);
  const host = window.location.host ?? '';
  const fileName = getFileNameFavicon(host);

  const result = await bucket.upload(fileName, bytes);

  if (!result.error) {
    return bucket.getPublicUrl(fileName).data.publicUrl;
  }

  throw result.error;
}

function getFileNameFavicon(
  host: string,
) {
  return `${host}_favicon_url`;
}